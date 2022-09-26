import { Server } from 'Socket.IO';
import User from '../dataClass/user';
import { RoomManager } from '../dataClass/room'

const getRooms = (io) => {
  const arr = Array.from(io.sockets.adapter.rooms);
  const arrFiltered = arr.filter(room => !room[1].has(room[0]));
  const roomsList = arrFiltered.map(i => i[0]);
  return roomsList;
}

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io
    const roomManager = new RoomManager();


    io.on('connection', socket => {
      let SocketUserID;
      let SocketRoomID;

      socket.on("disconnect", (reason) => {
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
          socket.join(roomID);

          roomManager.addUsertoRoom(user, roomID);
          const room = roomManager.getRoomByID(roomID);

          io.to(socket.id).emit('setGameState', 'lobby');
          io.to(roomID).emit('syncRoomObj', room);
          console.log(`connected ${user.username} to ${roomID}`);

          console.log(`room list :`, roomManager.getRoomList());
          console.log(`users in room ${roomID}`, roomManager.getUsersInRoom(roomID));

        } else {
          io.to(socket.id).emit('alert', `room ${roomID} not found`);
          console.log(`room list :`, roomManager.getRoomList());
        }
      })
    

      socket.on('removeUser', (userID) => {
        roomManager.removeUser(userID);
        console.log(`room list :`, roomManager.getRoomList());
      })

      socket.on('reqRoomObj', () => {
        const room = roomManager.getRoomByID(SocketRoomID);
        io.to(SocketRoomID).emit('syncRoomObj', room);
      })

    })

    
  }
  res.end()
}

export default SocketHandler