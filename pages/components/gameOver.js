import { Room } from '../dataClass/room';
import Leaderboard from './gameComponents/leaderboard'
import { useState, useContext, useEffect } from 'react';
import { SocketContext } from '../context/socketContext';
import styles from '/styles/GameOver.module.css';
import User from '../dataClass/user';

export default function GameOver() {
    const { socket, getUser } = useContext(SocketContext);
    const [userList, setUserList] = useState([])

    useEffect(() => {

        socketInitializer();
        socket.emit('reqRoomObj');

    }, []);

    
    const socketInitializer = () => {

        socket.on('syncRoomObj', (room) => {
            const sortedScore = room.users.sort((a, b) => b.score - a.score)
            console.log(sortedScore)
            setUserList(sortedScore)
        });

    }

    const toLobby = () => {
        socket.emit('toLobby')
    }

    const toMainMenu = () => {
        location.reload()
    }

    return (
        <div className={styles.container}>
            <div className={styles.winnerInfo}>
                <h1>{userList[0]?.username}</h1>
                <h3>!Wins the Game!</h3>
            </div>
            <div className={styles.buttonsContainer}>
                <button onClick={toLobby}>Room lobby</button>
                <button onClick={toMainMenu}>Main Menu</button>
            </div>
            <div className={styles.leaderboard}>
                <Leaderboard userList={userList}></Leaderboard>
            </div>
        </div>
    )
}
