import { useState, useContext, useEffect } from 'react';
import { SocketContext } from '/context/socketContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from '/styles/MainMenu.module.css';

export default function MainMenu() {
    const { socket, getUser, setUser } = useContext(SocketContext);
    const [username, setUsername] = useState('');
    const [option, setOption] = useState('create');
    const [destinationRoom, setDestinationRoom] = useState('');

    useEffect(() => {
        socketInitializer();
      }, []);
    
      const socketInitializer = () => {
        
      }
    
    const validateUsername = () => {
        if (username.length < 1) {
            toast.error('username must not be empty')
            return false
        } else if (username.length > 13) {
            toast.error('username must not be more than 12 characters')
            return false
        } else {
            return true
        }
    }

    const validateRoomID = () => {
        if (destinationRoom.length !== 6) {
            toast.error('invalid room id')
            return false
        } else {
            return true
        }
    }
    
    const joinRoom  = () => {
        if (validateUsername() && validateRoomID()) {
            setUser(username);
            const user = getUser();
            socket.emit('joinRoom', destinationRoom, user);
        }
    }
    
    const createRoom = () => {
        if (validateUsername()) {
            setUser(username);
            const user = getUser();
            socket.emit('createRoom', user.id, user);
        }
    }

    const changeHandler = (e) => {
        if (e.target.name === 'username') {
          setUsername(e.target.value);
        } else if (e.target.name === 'destinationRoom') {
          setDestinationRoom(e.target.value);
        }
    }

    const renderOption = () => {
        switch (option) {
            case 'create':
                return (
                    <div className={styles.inputs}>
                        <label>username</label>
                        <input type="text" name='username' value={username} onChange={changeHandler} placeholder='username'></input>
                    </div>
                    )
            case 'join':
                return (
                    <div className={styles.inputs}>
                        <label>username</label>
                        <input type="text" name='username' value={username} onChange={changeHandler} placeholder='username'></input>
                        <label>room id</label>
                        <input type="text" name='destinationRoom' value={destinationRoom} onChange={changeHandler} placeholder='roomId'></input>
                    </div>
                    )
        }
    }

    const playgame = () => {
        option==='create'? createRoom() : joinRoom();
    }

    return (
        <div>
            <div className={styles.title}>
                <h1><span className={styles.number}>24</span>
                <span className={styles.card}>CARD</span></h1>
                <h1 className={styles.game}>GAME</h1>
            </div>

            <div className={styles.menu}>
                <div className={styles.tabs}>
                    <button className={option==='create'?styles.active:styles.inactive}
                            onClick={() => setOption('create')}>Create Game</button>
                    <button className={option==='join'?styles.active:styles.inactive} 
                            onClick={() => setOption('join')}>Join Game</button>
                </div>
                <div className={styles.form}>
                    {renderOption()}
                    <button onClick={playgame}>Play</button>
                </div>
            </div>
        </div>
    )
}