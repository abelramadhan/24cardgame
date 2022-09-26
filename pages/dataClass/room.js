class Room {
    constructor(roomID) {
        this.roomID = roomID;
        this.hostID = ''
        this.users = [];
    }

    setHost = (hostID) => {
        this.hostID = hostID;
    }
}

class RoomManager {
    constructor() {
        this.roomList = [];
    }

    addRoom = (roomID) => {
        this.roomList.push(new Room(roomID));
    }

    removeRoom = (roomID) => {
        this.roomList = this.roomList.filter((room) => room.roomID !== roomID);
    }

    addUsertoRoom = (user, roomID) => {
        this.roomList.forEach((room) => {
            if (room.roomID === roomID) {
                room.users.push(user);
                room.setHost(room.users[0].id);
            }
        })
    }

    getRoomOfUser = (userID) => {
        let roomID = null
        this.roomList.forEach((room) => {
            if (room.users.some((user) => user.id === userID)) {
                roomID = room.roomID;
            }
        })
        return roomID;
    }

    removeUser = (userID) => {
        const roomID = this.getRoomOfUser(userID);
        console.log(roomID)
        this.roomList.forEach((room) => {
            if (room.roomID === roomID) {
                room.users = room.users.filter((userInRoom) => userInRoom.id !== userID);
                if (room.users.length < 1) {
                    this.removeRoom(room.roomID);
                    return;
                } else {
                    room.setHost(room.users[0].id);
                    return;
                }
            }
        })
    }

    getHostofRoom = (roomID) => {
        const room = this.roomList.find(room => room.roomID == roomID)
        return room.hostID
    }

    getRoomByID = (roomID) => {
        const room = this.roomList.find(room => room.roomID == roomID)
        return room
    }

    getUsersInRoom = (roomID) => {
        const room = this.roomList.find(room => room.roomID == roomID)
        return room.users
    }

    getRoomList = () => {
        return this.roomList.map((room) => room.roomID)
    }
}

export {RoomManager, Room }