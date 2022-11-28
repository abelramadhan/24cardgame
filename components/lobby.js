import { useState, useContext, useEffect } from 'react';
import { SocketContext } from '/context/socketContext';
import { Room } from '/dataClass/room';
import styles from '/styles/Lobby.module.css';

export default function Lobby() {
    const { socket, getUser, setUser } = useContext(SocketContext);
    const [roomObj, setRoomObj] = useState(new Room(''))
    const [isHost, setIsHost] = useState(false)
    const [easyMode, setEasyMode] = useState(true)

    const user = getUser();

    useEffect(() => {
        socketInitializer();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    const socketInitializer = () => {

        socket.emit('reqRoomObj');

        socket.on('syncRoomObj', (room) => {
            setRoomObj(room);
            setIsHost((room.hostID === user.id) ? true : false)
        });

        
    }

    const getUserList = () => {
        if (roomObj === {}) {
            return <li>no users</li>
        } else {
            return roomObj.users.map((user) => {
                if (roomObj.hostID === user.id) {
                    return <li key={user.id}>{user.username} (host)</li>
                } else {
                    return <li key={user.id}>{user.username}</li>
                }
            })
        }
    }

    const startGame = () => {
        console.log('starting game')
        socket.emit('startGame', easyMode);
    }

    const getPlayButton = () => {
        if (isHost) {
            return <button className={styles.primaryBtn} onClick={startGame}>Start Game</button>
        } else {
            return <button className={styles.disabledBtn}>Waiting For Host</button>
        }
    }

    const leaveRoom = () => {
        location.reload()
    }

    const toggleMode = () => {
        setEasyMode(!easyMode)
    }

    return (
        <div className={styles.container}>
            <div className={styles.roomInfo}>
                <div>
                    <h3>room id :</h3>
                    <h1>{roomObj.roomID}</h1>
                </div>
                <div className={styles.roomUsers}>
                    <h3>players :</h3>
                    <ol>
                        {getUserList()}
                    </ol>
                </div>
            </div>

            <div>
                {isHost &&
                <div className={styles.switch}>
                    <div className={styles.switchButton}>
                        <input className={styles.switchButtonCheckbox} onClick={toggleMode} type="checkbox"></input>
                        <label className={styles.switchButtonLabel}><span className={styles.switchButtonLabelSpan}></span></label>
                    </div>
                    <h3>easy mode</h3>
                </div>
                }
                
                
                <div className={styles.buttons}>
                    {getPlayButton()}
                    <button className={styles.secondaryBtn} onClick={leaveRoom}>Leave Room</button>
                </div>
            </div>
            

        </div>
    )
}