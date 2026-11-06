import { useState } from 'react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('미래지향적');
  const [story, setStory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const generateTravelStory = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/travel/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style })
      });
      const data = await response.json();
      setStory(data.storyText);
      setImageUrl(data.imageUrl); // 이미지 URL 세팅
    } catch (error) {
      console.error('에러 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>✨ 가상 여행 AI 서비스</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <label>여행지 및 테마:</label><br />
        <input 
          type="text" 
          value={prompt} 
          onChange={(e) => setPrompt(e.target.value)} 
          placeholder="예: 사이버펑크 네온사인 서울" 
          style={{ width: '100%', padding: '10px', marginTop: '5px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>스타일:</label><br />
        <input 
          type="text" 
          value={style} 
          onChange={(e) => setStyle(e.target.value)} 
          style={{ width: '100%', padding: '10px', marginTop: '5px' }}
        />
      </div>

      <button 
        onClick={generateTravelStory} 
        disabled={loading}
        style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
      >
        {loading ? '여행 스토리 및 풍경 생성 중...' : '여행 떠나기'}
      </button>

      {imageUrl && (
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <h3>🖼️ 가상 여행지 풍경</h3>
          <img 
            src={imageUrl} 
            alt="가상 여행지 이미지" 
            style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
          />
        </div>
      )}

      {story && (
        <div style={{ marginTop: '20px', padding: '20px', background: '#f9f9f9', borderRadius: '5px', whiteSpace: 'pre-wrap' }}>
          <h3>📖 여행 가이드북</h3>
          <p>{story}</p>
        </div>
      )}
    </div>
  );
}

export default App;