import { Server } from 'socket.io';
import { RoomManager } from '/dataClass/room'
import { CardCombination } from '/dataClass/combination';

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {

    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io
    const roomManager = new RoomManager();

    console.log('Generating Card Combinations')
    const cardCombination = new CardCombination()
    const combinationsNormal = cardCombination.generate()
    const combinationEasy = combinationsNormal.filter((combination) => combination.difficulty <= 6)

    const incrementRound = (roomID) => {
      const room = roomManager.getRoomByID(roomID);
      const selectedCombination = room.easyMode ? combinationEasy : combinationsNormal
      const random = Math.floor(Math.random() * (selectedCombination.length))
      const cards = selectedCombination[random].values

      if (room.round >= 10) {
        io.to(roomID).emit('setGameState', 'gameOver');
      }

      roomManager.incrementRoomRound(roomID)
      io.to(roomID).emit('setCards', cards)
      io.to(roomID).emit('syncRoomObj', room);
    }

    const syncRoom = (roomID) => {
      const room = roomManager.getRoomByID(roomID);
      io.to(roomID).emit('syncRoomObj', room);
    }

    io.on('connection', socket => {
      let SocketUserID;
      let SocketRoomID;

      socket.on("disconnect", (reason) => {
        console.log(reason)
        roomManager.removeUser(SocketUserID);
        console.log(`room list :`, roomManager.getRoomList());
        const room = roomManager.getRoomByID(SocketRoomID);
        io.to(SocketRoomID).emit('syncRoomObj', room);
      });

      socket.on('createRoom', (roomID, user) => {
        SocketUserID = user.id;
        SocketRoomID = roomID
        socket.join(roomID);

        roomManager.addRoom(roomID);
        roomManager.addUsertoRoom(user, roomID);
        const room = roomManager.getRoomByID(roomID);

        io.to(socket.id).emit('setGameState', 'lobby');
        io.to(roomID).emit('syncRoomObj', room);
        console.log(`connected ${user.username} to ${roomID}`);

        console.log(`room list :`, roomManager.getRoomList());
        console.log(`users in room ${roomID}`, roomManager.getUsersInRoom(roomID));

      })

      socket.on('joinRoom', (roomID, user) => {
        const rooms = roomManager.getRoomList();
        if (rooms.includes(roomID)) {
          SocketUserID = user.id;
          SocketRoomID = roomID
          const room = roomManager.getRoomByID(roomID);

          if (room.users.length <= 10) {
            socket.join(roomID);

            roomManager.addUsertoRoom(user, roomID);

            const state = room.round === 0 ? 'lobby' : 'game'

            io.to(socket.id).emit('setGameState', state);
            io.to(roomID).emit('syncRoomObj', room);
            console.log(`connected ${user.username} to ${roomID}`);

            console.log(`room list :`, roomManager.getRoomList());
            console.log(`users in room ${roomID}`, roomManager.getUsersInRoom(roomID));

          } else {
            io.to(socket.id).emit('alert', `room ${roomID} is full`);
          }
        } else {
          io.to(socket.id).emit('alert', `room ${roomID} not found`);
          console.log(`room list :`, roomManager.getRoomList());
        }
      })


      socket.on('reqRoomObj', () => {
        syncRoom(SocketRoomID)
      })

      socket.on('startGame', (easyMode) => {
        roomManager.setRoomMode(SocketRoomID, easyMode)
        roomManager.resetRoomRound(SocketRoomID)
        roomManager.resetRoomScore(SocketRoomID)
        io.to(SocketRoomID).emit('setGameState', 'game')
      })

      socket.on('requestCards', () => {
        incrementRound(SocketRoomID)
      })

      socket.on('toLobby', () => {
        io.to(socket.id).emit('setGameState', 'lobby')
      })

      socket.on('scoreSubmit', (roomID, userID, score) => {
        roomManager.incrementUserScore(roomID, userID, score)
        const room = roomManager.getRoomByID(SocketRoomID);
        io.to(SocketRoomID).emit('syncRoomObj', room);

        let allSubmitted = true

        for (const user of room.users) {
          if (!user.submitted) {
            allSubmitted = false
            break
          }
        }

        if (allSubmitted) {
          incrementRound(SocketRoomID)
        }

      })

    })

    


  }
  res.end()
}



export default SocketHandler