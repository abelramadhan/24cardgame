import { useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTimer } from 'react-timer-hook';
import { SocketContext } from '/context/socketContext';
import { StepManager } from '/dataClass/inputStep';
import { Room } from '/dataClass/room';
import { CardObject } from '/dataClass/cardManager';
import Leaderboard from './gameComponents/leaderboard'
import Card from './gameComponents/card';
import styles from '/styles/Game.module.css';

let isHost = false
let user

export default function Game() {
    const { socket, getUser } = useContext(SocketContext);
    const [roomObj, setRoomObj] = useState(new Room(''));
    const [cardSet, setCardSet] = useState([]);
    const [inputStep, setInputStep] = useState(new StepManager())
    const [preInputs, setPreInputs]  = useState([])
    const [operators, setOperators] = useState([new CardObject('+'), new CardObject('-'), new CardObject('*'), new CardObject('/')])
    const [finish, setFinish] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const getTime = (seconds) => {
        const timeLimit = new Date()
        timeLimit.setSeconds(timeLimit.getSeconds() + seconds)
        return timeLimit
    }

    const Timer = useTimer({ expiryTimestamp: getTime(60), onExpire: () =>  reqCards()})

    useEffect(() => {

        user = getUser()
        socketInitializer();

        socket.emit('reqRoomObj');

        setTimeout(reqCards, 2000)
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    const reqCards = () => {
        if (isHost) {
            socket.emit('requestCards');
        }
    }

    const socketInitializer = () => {

        socket.on('syncRoomObj', (room) => {
            if (room.hostID === user.id) {
                isHost = true
            }
            setRoomObj(room)
        });

        socket.on('setCards', (cards) => {
            setCardSet([])
            setFinish(false)
            setSubmitted(false)
            clearSolution()
            setTimeout(()=>{
                setCardSet([new CardObject(cards[0]), new CardObject(cards[1]), new CardObject(cards[2]), new CardObject(cards[3])])
            }, 1000)
            Timer.restart(getTime(60))

        });


    }

    const clearSolution = () => {
        cardSet.forEach(card => card.state = 'default')
        operators.forEach(card => card.state = 'default')
        setPreInputs([])
        setFinish(false)
        setInputStep(new StepManager())
    }

    const setCardState = (cardIndex, state) => {
        if (cardIndex < 4) {
            cardSet[cardIndex].state = state
            setCardSet([...cardSet])
        } else if (cardIndex < 8) {
            operators[cardIndex-4].state = state
            setOperators([...operators])
        } else {
            inputStep.stepList[cardIndex-8].result.state = state
            setOperators([...operators])
        }
    }

    const undoStep = () => {
        if (preInputs.length !== 0) {
            setCardState(preInputs[1], 'default')
            operators.forEach(card => card.state = 'default')
        } else {
            if (inputStep.currentStep === 0) {
                return
            }
            let indices = [inputStep.usedCards[inputStep.usedCards.length-1], inputStep.usedCards[inputStep.usedCards.length-2]]
            indices.forEach(cardIndex => {
                setCardState(cardIndex, 'default')
            })
            inputStep.removeStep()
        }
        setPreInputs([])
        setFinish(false)
    }

    const drawCard = () => {
        reqCards()
        setSubmitted(false)
    }

    const isResultInteger = (val1, val2) => {
        if (val1 % val2 === 0) {
            return true
        } else {
            return false
        }
    }

    const addPreInput = (cardObj, index) => {

        if (cardObj.state === 'inactive' || cardObj.state === 'active' || finish || submitted) {
            return
        } else if ((preInputs.length === 0 || preInputs.length === 4) && !Number.isFinite(cardObj.value)) {
            toast.warning('select a number from a card')
        } else if (preInputs.length === 2 && Number.isFinite(cardObj.value)){
            toast.warning('select an operator')
        } else {
            preInputs.push(cardObj.value, index)  
            setCardState(index, 'active')
            setCardSet([...cardSet])
        }

        if (preInputs.length === 6) {
            if (preInputs[2] === '/') {
                if (!isResultInteger(preInputs[0], preInputs[4])) {
                    toast.warning('division result must be an Integer')
                    setCardState(preInputs[1], 'default')
                    setCardState(preInputs[3], 'default')
                    setCardState(preInputs[5], 'default')
                    setPreInputs([])
                    return
                }
            }
            inputStep.usedCards.push(preInputs[1], preInputs[5])
            inputStep.addStep(preInputs[0], preInputs[2], preInputs[4])
            setCardState(preInputs[1], 'inactive')
            setCardState(preInputs[3], 'default')
            setCardState(preInputs[5], 'inactive')
            setPreInputs([])
        }

        if (inputStep.stepList.length === 3) {
            setFinish(true)
        }
    }

    const submitScore = () => {
        if (submitted || inputStep.stepList.length < 2) {
            return
        }
        if (inputStep.stepList[2].result.value === 24) {
            const score = Math.round(1000 - ((60-Timer.seconds)/60)*1000)
            socket.emit('scoreSubmit', roomObj.roomID, user.id, score)
            setFinish(false)
            setSubmitted(true)
        } else {
            toast.error('wrong answer')
        }
    }

    const renderCards = () => {
        if (cardSet.length !== 0) {
            return (
                <div className={styles.cardSet}>
                    <Card value={cardSet[0].value} onClick={() => addPreInput(cardSet[0], 0)} extraClass={[cardSet[0].state, 'mainCard']}></Card>
                    <Card value={cardSet[1].value} onClick={() => addPreInput(cardSet[1], 1)} extraClass={[cardSet[1].state, 'mainCard']}></Card>
                    <Card value={cardSet[2].value} onClick={() => addPreInput(cardSet[2], 2)} extraClass={[cardSet[2].state, 'mainCard']}></Card>
                    <Card value={cardSet[3].value} onClick={() => addPreInput(cardSet[3], 3)} extraClass={[cardSet[3].state, 'mainCard']}></Card>
                </div>
            )
        } else {
            return <h1>get ready for next round</h1>
        }
    }

    const renderOperators = () => {
        return (
            <div className={styles.operatorsGrid}>
                <Card value={operators[0].value} onClick={() => addPreInput(operators[0], 4)} extraClass={[operators[0].state, 'operator']}></Card>
                <Card value={operators[1].value} onClick={() => addPreInput(operators[1], 5)} extraClass={[operators[1].state, 'operator']}></Card>
                <Card value={operators[2].value} onClick={() => addPreInput(operators[2], 6)} extraClass={[operators[2].state, 'operator']}></Card>
                <Card value={operators[3].value} onClick={() => addPreInput(operators[3], 7)} extraClass={[operators[3].state, 'operator']}></Card>
            </div>
        )
    }

    const renderSteps = () => {
        return (
            <div className={styles.stepList}>
                <h3>solution steps :</h3>
                {inputStep.stepList.map((step, index) => {
                    return (
                        <div key={index} className={styles.step}>
                            <Card value={step.operand1} extraClass={['stepItem', 'inactive']}></Card>
                            <h2>{step.operator}</h2>
                            <Card value={step.operand2} extraClass={['stepItem', 'inactive']}></Card>
                            <h2>=</h2>
                            <Card value={step.result.value} extraClass={[step.result.state, 'stepItem']} onClick={() => addPreInput(step.result, index+8)}></Card>
                        </div> 
                    )
                })}
            </div>
        )
    }

    const renderTimer = () => {
        if (cardSet.length !== 0) {
            const message = submitted ? 'waiting for other players' : 'remaining time :'
            return (
                <div className={styles.timer}>
                    <h2>{message}</h2>
                    <h3>{Timer.minutes.toString().padStart(2, '0')}:{Timer.seconds.toString().padStart(2, '0')}</h3>
                </div>
            )
        } else {
            const number = 0
            return (
                <div className={styles.timer}>
                    <h2>waiting for next round</h2>
                    <h3>{number.toString().padStart(2, '0')}:{number.toString().padStart(2, '0')}</h3>
                </div>
            )
        }
        
    }

    return (
        <div className={styles.container}>
            <aside className={styles.userList}>
                <div className={styles.roomInfo}>
                    <h1 className={styles.roomID}>{roomObj.roomID}</h1>
                    <h3 className={styles.round}>Round {roomObj.round}/10</h3>
                </div>
                <Leaderboard userList={roomObj.users}></Leaderboard>
            </aside>
            <div className={styles.gameContainer}>
                <div className={styles.top}>
                    {renderCards()}
                </div>
                <div className={styles.bottom}>
                    {renderSteps()}
                    <div className={styles.operatorsContainer}>
                        <h3>operators :</h3>
                        {renderOperators()}
                    </div>
                    <div className={styles.buttonContainer}>
                        {renderTimer()}
                        <div className={styles.buttonGroup}>
                            <button className={styles.undo} onClick={undoStep}>undo</button>
                            <button className={styles.clear} onClick={clearSolution}>clear</button>
                        </div>
                        <button onClick={drawCard}>Next</button>
                        <button className={finish ? styles.finish : styles.unfinish} onClick={submitScore}>submit</button>
                    </div>
                </div>
            </div>
        </div>
    )

}