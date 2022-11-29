import User from '/dataClass/user'
import { io } from "socket.io-client";
import { createContext } from "react";

let socket;
let user = new User('');
const IS_PROD = process.env.NODE_ENV === "production";
const URL = IS_PROD ? "cardgame24.herokuapp.com" : "http://localhost:3000";

const initServer = async () => {
    
    await fetch(`${URL}/api/socket`);
    socket = io(URL);

    socket.on('connect', () => {
        console.log('connected');
    })

    socket.on('disconnect', () => {
        socket.emit('removeUser', user.id)
    })

}

initServer();

const setUser = (username) => {
    user = new User(username)
}

const getUser = () => {
    return user
}

const SocketContext = createContext();

export {socket, SocketContext, setUser, getUser}