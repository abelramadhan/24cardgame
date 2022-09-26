import User from '../dataClass/user'
import { io } from "socket.io-client";
import { createContext } from "react";

let socket;
let user = new User('');

const initServer = async () => {
    await fetch('http://localhost:3000/api/socket');
    socket = io();

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