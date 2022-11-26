import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { useEffect, useState } from 'react';
import { SocketContext, socket, setUser, getUser } from './context/socketContext';
import MainMenu from './components/mainMenu';
import Lobby from './components/lobby';
import Game from './components/game';
import GameOver from './components/gameOver';
import { ToastContainer, toast } from 'react-toastify';

export default function Home() {
  const [gameState, setGameState] = useState('mainMenu');

  useEffect(() => {
    socketInitializer();
  }, []);

  const socketInitializer = () => {

    socket.on("setGameState", (state) => {
      setGameState(state);
    });

    socket.on("receiveMsg", (msg) => {
      console.log(msg);
    });

    socket.on("alert", (msg) => {
      toast.error(msg);
    });

  }

  //create user object to store to localstorage
  const renderGameState = () => {
    switch (gameState) {
      case 'mainMenu':
        return(
          <MainMenu context={SocketContext}></MainMenu>
        )
      case 'lobby':
        return(
          <Lobby context={SocketContext}></Lobby>
        )
      case 'game':
        return(
          <Game context={SocketContext}></Game>
        )
        case 'gameOver':
          return(
            <GameOver context={SocketContext}></GameOver>
          )
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>24 Card Game</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <SocketContext.Provider value={{socket: socket, getUser: getUser, setUser: setUser}}>
          {renderGameState()}
        </SocketContext.Provider>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
      <ToastContainer
          theme='dark'
          position="top-center"
          autoClose={700}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover={false}
        />
    </div>
  )
}
