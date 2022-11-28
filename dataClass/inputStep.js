import {evaluate} from 'mathjs'
import { CardObject } from '/dataClass/cardManager';

class Step {
    constructor(operand1, operator, operand2) {
        this.operand1 = operand1
        this.operand2 = operand2
        this.operator = operator
        this.result = new CardObject(evaluate(`${operand1}${operator}${operand2}`), 'step')
    }
}

class StepManager {
    constructor() {
        this.stepList = []
        this.usedCards = []
        this.currentStep = 0
    }

    addStep = (operand1, operator, operand2) => {
        this.stepList.push(new Step(operand1, operator, operand2))
        this.currentStep++
    }

    removeStep = () => {
        this.usedCards.pop()
        this.usedCards.pop()
        this.currentStep--
        this.stepList.pop()
    }
}

export {Step, StepManager}