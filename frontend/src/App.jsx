import { useState } from 'react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [story, setStory] = useState('');         
  const [imageUrl, setImageUrl] = useState('');
  const [choices, setChoices] = useState([]);     
  const [loading, setLoading] = useState(false);

  const sendAction = async (inputPrompt) => {
    if (!inputPrompt.trim()) return;
    setLoading(true);
    
    // 💡 로딩이 시작될 때 이전 이미지와 선택지를 미리 비워버리고 싶다면 아래 주석을 해제하세요!
    // setImageUrl('');
    // setChoices([]);

    try {
      const response = await fetch('http://localhost:8080/api/travel/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: inputPrompt, 
          previousStory: story 
        })
      });
      const data = await response.json();
      
      setStory(data.storyText);
      setImageUrl(data.imageUrl);
      setChoices(data.choices || []);
      setPrompt(''); 
    } catch (error) {
      console.error('에러 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>🇯🇵 인터랙티브 가상 일본 여행</h2>

      {/* 1. 로딩 중이 아닐 때만 이미지 출력 */}
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
      <div style={{ marginBottom: '20px', padding: '20px', background: '#f9f9f9', borderRadius: '5px', whiteSpace: 'pre-wrap', minHeight: '100px' }}>
        <h3>📖 현재 여정</h3>
        <p>
          {loading 
            ? "⏳ 다음 여정을 불러오는 중입니다...\n새로운 풍경과 선택지를 준비하고 있어요!" 
            : (story ? story : "아직 여행이 시작되지 않았습니다. 가고 싶은 장소나 테마를 입력하고 여행을 떠나보세요!")}
        </p>
      </div>

      {/* 2. 로딩 중이 아닐 때만 선택지 버튼 3개 출력 */}
      {!loading && choices.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold' }}>✨ 다음 행동을 선택하세요:</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => sendAction(choice)}
                style={{ padding: '10px', background: '#e2e8f0', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', textAlign: 'left' }}
              >
                👉 {choice}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 입력창 */}
      <div style={{ marginBottom: '15px' }}>
        <label>{story ? "✍️ 직접 행동이나 장소를 입력하기:" : "가고 싶은 일본 여행지 및 테마:"}</label><br />
        <input 
          type="text" 
          value={prompt} 
          onChange={(e) => setPrompt(e.target.value)} 
          placeholder={story ? "예: 도톤보리 타코야키 가게 안으로 들어간다" : "예: 오사카 축제 야시장"} 
          disabled={loading} // 로딩 중엔 입력도 막기
          style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box', background: loading ? '#f1f5f9' : '#fff' }}
        />
      </div>

      <button 
        onClick={() => sendAction(prompt)} 
        disabled={loading}
        style={{ width: '100%', padding: '12px', background: loading ? '#94a3b8' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
      >
        {loading ? '여정 생성 중...' : (story ? '행동 실행하기' : '여행 떠나기')}
      </button>
    </div>
  );
}

export default App;