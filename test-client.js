const { io } = require('socket.io-client');

const userId = process.argv[2] || 'user1';
const matchIdRef = { value: null };
const gameIdRef = { value: null };

const socket = io('ws://localhost:13001/game', {
  query: { userId },
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log(`[${userId}] connected!`);
  // 매칭 요청
  socket.emit('match_request', { userId });
});

socket.on('match_waiting', (data) => {
  console.log(`[${userId}] 매칭 대기...`, data);
});

socket.on('match_found', (data) => {
  console.log(`[${userId}] 매칭 완료!`, data);
  matchIdRef.value = data.match.id;
  // 방 준비 완료
  setTimeout(() => {
    socket.emit('room_ready', { matchId: matchIdRef.value, userId });
  }, 1000);
});

socket.on('signal', (data) => {
  const clientReceiveTime = Date.now();
  const serverTime = data.timestamp;
  const timeDiff = clientReceiveTime - serverTime;
  
  console.log(`[${userId}] 신호 수신:`, data);
  console.log(`[${userId}] 네트워크 지연: ${timeDiff}ms`);
  
  // gameId 저장
  if (data.gameId) {
    gameIdRef.value = data.gameId;
    console.log(`[${userId}] 게임 ID 저장: ${gameIdRef.value}`);
  }
  
  // 정상 신호(value: 1)일 때만 버튼 클릭
  if (data.value === 1) {
    const targetGameId = gameIdRef.value || matchIdRef.value;
    console.log(`[${userId}] 신호 전송: gameId=${targetGameId}`);
    
    // 네트워크 지연을 고려한 지연 시간 조정
    const baseDelay = Math.floor(Math.random() * 500) + 100; // 100~600ms
    const adjustedDelay = Math.max(0, baseDelay - timeDiff); // 지연 시간에서 네트워크 지연 차감
    
    setTimeout(() => {
      const sendTime = Date.now();
      socket.emit('send_signal', { 
        gameId: targetGameId, 
        userId, 
        type: data.type, 
        value: data.value,
        clientSendTime: sendTime,
        serverReceiveTime: serverTime
      });
      console.log(`[${userId}] 신호 전송 완료: ${sendTime - clientReceiveTime}ms 후`);
    }, adjustedDelay);
  }
});

socket.on('game_result', (data) => {
  console.log(`[${userId}] 게임 결과:`, data);
});

socket.on('status_update', (data) => {
  console.log(`[${userId}] 상태 업데이트:`, data);
});

socket.on('error', (data) => {
  console.log(`[${userId}] 오류:`, data);
});

// 테스트: 10초 후 방 취소
setTimeout(() => {
  if (matchIdRef.value) {
    socket.emit('room_cancel', { matchId: matchIdRef.value, userId });
  }
}, 10000);

// 테스트: 20초 후 강제 종료
setTimeout(() => {
  if (matchIdRef.value) {
    socket.emit('force_end', { matchId: matchIdRef.value, reason: '테스트 강제 종료' });
  }
}, 20000); 