class Room {
    constructor(roomID) {
        this.roomID = roomID;
        this.hostID = ''
        this.users = [];
        this.easyMode = false
        this.round = 0
    }

    nextRound = () => {
        this.round++
    }

    setHost = (hostID) => {
        this.hostID = hostID;
    }

    setEasyMode = (easyMode) => {
        this.difficulty = easyMode;
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

    setRoomMode = (roomID, easyMode) => {
        this.roomList.forEach((room) => {
            if (room.roomID === roomID) {
                room.setEasyMode(easyMode)
            }
        })
    }

    incrementRoomRound = (roomID) => {
        const roomIndex = this.roomList.findIndex(room => room.roomID === roomID)
        this.roomList[roomIndex].users.forEach((user) => {
            user.submitted = false
        })
        this.roomList[roomIndex].nextRound()
    }

    resetRoomRound = (roomID) => {
        const roomIndex = this.roomList.findIndex(room => room.roomID === roomID)
        this.roomList[roomIndex].round = 0
    }

    resetRoomScore = (roomID) => {
        const roomIndex = this.roomList.findIndex(room => room.roomID === roomID)
        this.roomList[roomIndex].users.map((user) => {
            user.score = 0
            user.submitted = false
        })
    }

    incrementUserScore = (roomID, userID, score) => {
        const roomIndex = this.roomList.findIndex(room => room.roomID === roomID)
        const userIndex = this.roomList[roomIndex].users.findIndex(user => user.id === userID)
        this.roomList[roomIndex].users[userIndex].submitted = true
        this.roomList[roomIndex].users[userIndex].score += score
    }
}

export { RoomManager, Room }