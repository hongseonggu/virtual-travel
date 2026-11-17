import { useState, useRef } from 'react';
import './App.css';

function App() {
  // 🧭 초기 설정 화면용 상태
  const [destinationInput, setDestinationInput] = useState('');
  const [initialMoneyInput, setInitialMoneyInput] = useState(100000);
  const [isStarted, setIsStarted] = useState(false);

  // 🎮 게임 진행용 상태
  const [prompt, setPrompt] = useState('');
  const [story, setStory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [choices, setChoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const [money, setMoney] = useState(100000);
  const [currentTime, setCurrentTime] = useState('1일차 낮');
  const [location, setLocation] = useState('출발지');
  const [weather, setWeather] = useState('맑음');

  // 📖 여행 기록(로그) 상태
  const [travelLogs, setTravelLogs] = useState([]);
  const [showDiary, setShowDiary] = useState(false);

  // 🎵 BGM 재생 관련 상태 및 Ref
  const [isPlayingBgm, setIsPlayingBgm] = useState(false);
  const audioRef = useRef(null);

  const toggleBgm = () => {
    if (!audioRef.current) return;
    audioRef.current.volume = 0.15;

    if (isPlayingBgm) {
      audioRef.current.pause();
      setIsPlayingBgm(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingBgm(true);
      }).catch(err => {
        console.log("오디오 재생 실패:", err);
      });
    }
  };

  // 🎨 시간대와 날씨에 따른 동적 테마 계산
  const getTheme = () => {
    const isSunset = currentTime.includes('노을') || currentTime.includes('해질녘') || currentTime.includes('일몰') || currentTime.includes('황혼');
    const isNight = currentTime.includes('저녁') || currentTime.includes('밤') || currentTime.includes('심야');
    const isRainy = weather.includes('비');

    if (isNight) {
      return {
        outerBg: isRainy ? '#0c192c' : '#0f172a',
        cardBg: '#1e293b',
        cardBorder: isRainy ? '#38bdf8' : '#334155',
        textColor: '#f8fafc',
        subBoxBg: '#0f172a',
        subBoxBorder: '#334155',
        isDark: true
      };
    }

    if (isSunset) {
      return {
        outerBg: isRainy 
          ? 'linear-gradient(180deg, #cbd5e1 0%, #fed7aa 100%)' 
          : 'linear-gradient(180deg, #ffedd5 0%, #fed7aa 50%, #fdba74 100%)',
        cardBg: '#fffbf7',
        cardBorder: '#fb923c',
        textColor: '#27272a',
        subBoxBg: '#fff7ed',
        subBoxBorder: '#fed7aa',
        isDark: false
      };
    }

    if (isRainy) {
      return {
        outerBg: '#e0f2fe',
        cardBg: '#ffffff',
        cardBorder: '#7dd3fc',
        textColor: '#1e293b',
        subBoxBg: '#f0f9ff',
        subBoxBorder: '#bae6fd',
        isDark: false
      };
    }

    return {
      outerBg: '#fefce8',
      cardBg: '#ffffff',
      cardBorder: '#fde68a',
      textColor: '#1e293b',
      subBoxBg: '#f8fafc',
      subBoxBorder: '#e2e8f0',
      isDark: false
    };
  };

  const theme = getTheme();

  const startTravel = async () => {
    if (!destinationInput.trim()) {
      alert("가고 싶은 여행지나 테마를 입력해주세요!");
      return;
    }

    const startingMoney = Number(initialMoneyInput) || 100000;
    setMoney(startingMoney);
    setLocation(destinationInput);
    setTravelLogs([]); // 새 여행 시작 시 기록 초기화
    setIsStarted(true);

    if (audioRef.current) {
      audioRef.current.volume = 0.15;
      audioRef.current.play().then(() => {
        setIsPlayingBgm(true);
      }).catch(err => {
        console.log("자동 재생 차단됨:", err);
      });
    }

    const initialPrompt = `${destinationInput}으로 여행을 시작한다. 초기 예산은 ${startingMoney.toLocaleString()}엔이다.`;
    await sendAction(initialPrompt, startingMoney, '1일차 낮', destinationInput, '맑음', '', true);
  };

  const sendAction = async (
    inputPrompt,
    currentMoneyVal = money,
    currentTimeVal = currentTime,
    currentLocationVal = location,
    currentWeatherVal = weather,
    previousStoryVal = story,
    isFirstTurn = false
  ) => {
    if (!inputPrompt.trim()) return;
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/travel/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: inputPrompt,
          previousStory: previousStoryVal,
          currentMoney: currentMoneyVal,
          currentTime: currentTimeVal,
          currentLocation: currentLocationVal,
          currentWeather: currentWeatherVal
        })
      });
      const data = await response.json();

      setStory(data.storyText);
      setImageUrl(data.imageUrl);
      setChoices(data.choices || []);

      const nextMoney = currentMoneyVal + data.moneyDelta;
      const nextTime = data.timeUpdate || currentTimeVal;
      const nextLocation = data.location || currentLocationVal;
      const nextWeather = data.weather || currentWeatherVal;

      setMoney(nextMoney);
      setCurrentTime(nextTime);
      setLocation(nextLocation);
      setWeather(nextWeather);

      // 📖 여행 일지에 현재 턴 기록 누적
      setTravelLogs(prev => [
        ...prev,
        {
          step: prev.length + 1,
          action: isFirstTurn ? `${destinationInput} 여행 출발` : inputPrompt,
          time: nextTime,
          location: nextLocation,
          weather: nextWeather,
          moneyDelta: data.moneyDelta,
          remainingMoney: nextMoney,
          story: data.storyText,
          imageUrl: data.imageUrl
        }
      ]);

      setPrompt('');
    } catch (error) {
      console.error('에러 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (w) => {
    if (w.includes('비')) return '🌧️';
    if (w.includes('흐림')) return '☁️';
    return '☀️';
  };

  const getTimeIcon = (t) => {
    if (t.includes('노을') || t.includes('해질녘') || t.includes('일몰')) return '🌇';
    if (t.includes('저녁') || t.includes('밤') || t.includes('심야')) return '🌙';
    return '⏰';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.outerBg,
      padding: '40px 20px',
      boxSizing: 'border-box',
      fontFamily: 'sans-serif',
      transition: 'all 0.6s ease'
    }}>
      <audio ref={audioRef} src="/mornig.mp3" loop />

      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: theme.cardBg,
        color: theme.textColor,
        padding: '35px',
        borderRadius: '16px',
        border: `1px solid ${theme.cardBorder}`,
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.6s ease',
        position: 'relative'
      }}>
        {/* 상단 타이틀 및 컨트롤 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '21px' }}>🇯🇵 일본 가상 여행 시뮬레이터</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {isStarted && (
              <button
                onClick={() => setShowDiary(!showDiary)}
                style={{
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  borderRadius: '20px',
                  border: '1px solid #cbd5e1',
                  background: showDiary ? '#0284c7' : '#f1f5f9',
                  color: showDiary ? '#fff' : '#334155',
                  cursor: 'pointer'
                }}
              >
                {showDiary ? '🎮 여행으로 돌아가기' : `📖 여행 일지 (${travelLogs.length})`}
              </button>
            )}
            <button 
              onClick={toggleBgm}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: 'bold',
                borderRadius: '20px',
                border: '1px solid #cbd5e1',
                background: isPlayingBgm ? '#22c55e' : '#e2e8f0',
                color: isPlayingBgm ? '#fff' : '#475569',
                cursor: 'pointer'
              }}
            >
              {isPlayingBgm ? '🎵 ON' : '🔇 OFF'}
            </button>
          </div>
        </div>

        {!isStarted ? (
          <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#1e293b' }}>
            <h3 style={{ marginTop: 0 }}>✈️ 여행 준비 (엔화 기준)</h3>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#334155' }}>가고 싶은 일본 도시 및 컨셉</label>
              <input
                type="text"
                value={destinationInput}
                onChange={(e) => setDestinationInput(e.target.value)}
                placeholder="예: 오사카 도톤보리 먹방 여행"
                style={{ width: '100%', padding: '12px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '15px' }}
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#334155' }}>시작 소지금 (엔화 JPY)</label>
              <input
                type="number"
                value={initialMoneyInput}
                onChange={(e) => setInitialMoneyInput(e.target.value)}
                style={{ width: '100%', padding: '12px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '15px' }}
              />
            </div>

            <button
              onClick={startTravel}
              style={{ width: '100%', padding: '14px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
            >
              🚀 여행 출발하기
            </button>
          </div>
        ) : showDiary ? (
          /* 📖 여행 일지(기록) 타임라인 화면 */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>📓 나의 일본 여행 발자취</h3>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#0284c7' }}>
                총 지출: ¥{(Number(initialMoneyInput) - money).toLocaleString()} 엔
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '550px', overflowY: 'auto', paddingRight: '5px' }}>
              {travelLogs.map((log) => (
                <div key={log.step} style={{
                  padding: '15px',
                  background: theme.subBoxBg,
                  border: `1px solid ${theme.subBoxBorder}`,
                  borderRadius: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', opacity: 0.85, marginBottom: '6px' }}>
                    <span><strong>#{log.step}</strong> | {log.time} | 📍 {log.location}</span>
                    <span style={{ 
                      fontWeight: 'bold', 
                      color: log.moneyDelta < 0 ? '#ef4444' : (log.moneyDelta > 0 ? '#22c55e' : 'inherit') 
                    }}>
                      {log.moneyDelta === 0 ? '변동 없음' : `${log.moneyDelta > 0 ? '+' : ''}¥${log.moneyDelta.toLocaleString()}`}
                    </span>
                  </div>

                  <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '8px', color: theme.isDark ? '#38bdf8' : '#0369a1' }}>
                    👉 {log.action}
                  </div>

                  {log.imageUrl && (
                    <img 
                      src={log.imageUrl} 
                      alt={log.location} 
                      style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} 
                    />
                  )}

                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                    {log.story}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* 🎮 일반 여행 진행 화면 */
          <div>
            {/* 상단 상태창 */}
            <div style={{ background: '#334155', color: '#fff', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #475569', fontSize: '14px' }}>
                <div>📍 현재 위치: <strong>{location}</strong></div>
                <div>{getWeatherIcon(weather)} 날씨: <strong>{weather}</strong></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '15px' }}>
                <div>💰 잔여 예산: ¥{money.toLocaleString()} 엔</div>
                <div>{getTimeIcon(currentTime)} 일정: {currentTime}</div>
              </div>
            </div>

            {/* 이미지 영역 */}
            {!loading && imageUrl && (
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <img
                  src={imageUrl}
                  alt="가상 여행지 풍경"
                  style={{ width: '100%', maxHeight: '350px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
              </div>
            )}

            {/* 현재 여정 가이드북 */}
            <div style={{
              marginBottom: '20px',
              padding: '20px',
              background: theme.subBoxBg,
              borderRadius: '8px',
              whiteSpace: 'pre-wrap',
              minHeight: '100px',
              border: `1px solid ${theme.subBoxBorder}`,
              lineHeight: '1.6',
              transition: 'all 0.6s ease'
            }}>
              <h3 style={{ marginTop: 0 }}>📖 현재 여정</h3>
              <p style={{ marginBottom: 0 }}>
                {loading
                  ? "⏳ 다음 여정을 불러오는 중입니다...\n현지 위치와 날씨, 물가를 계산하고 있어요!"
                  : story}
              </p>
            </div>

            {/* 선택지 3개 */}
            {!loading && choices.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 'bold' }}>✨ 다음 행동을 선택하세요:</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  {choices.map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => sendAction(choice.text)}
                      style={{
                        padding: '12px 15px',
                        background: theme.isDark ? '#334155' : '#f1f5f9',
                        border: `1px solid ${theme.isDark ? '#475569' : '#cbd5e1'}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: '500',
                        color: theme.textColor,
                        textAlign: 'left'
                      }}
                    >
                      <span>👉 {choice.text}</span>

                      <span style={{
                        fontSize: '13px',
                        fontWeight: 'bold',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: choice.estimatedCost < 0 ? '#fee2e2' : (choice.estimatedCost > 0 ? '#dcfce7' : '#e2e8f0'),
                        color: choice.estimatedCost < 0 ? '#b91c1c' : (choice.estimatedCost > 0 ? '#15803d' : '#475569'),
                        flexShrink: 0,
                        marginLeft: '10px'
                      }}>
                        {choice.estimatedCost === 0
                          ? '무료 (¥0)'
                          : `${choice.estimatedCost > 0 ? '+' : ''}¥${choice.estimatedCost.toLocaleString()}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 주관식 입력창 */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold' }}>✍️ 주관식 행동 입력</label><br />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="예: 근처 이자카야에서 하이볼 한 잔 마시기"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '6px',
                  boxSizing: 'border-box',
                  borderRadius: '6px',
                  border: `1px solid ${theme.isDark ? '#475569' : '#cbd5e1'}`,
                  background: theme.isDark ? '#0f172a' : (loading ? '#f1f5f9' : '#fff'),
                  color: theme.textColor
                }}
              />
            </div>

            <button
              onClick={() => sendAction(prompt)}
              disabled={loading}
              style={{ width: '100%', padding: '14px', background: loading ? '#94a3b8' : '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
            >
              {loading ? '여정 생성 중...' : '행동 실행하기'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;