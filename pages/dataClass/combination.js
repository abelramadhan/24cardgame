const solve24 = require('/node_modules/24game-solver/dist/24game-solver');
const additon = new RegExp('[+]', 'g');
const subtraction = new RegExp('[-]', 'g');
const multiplacation = new RegExp('[*]', 'g');
const divison = new RegExp('[/]', 'g');

const calcDifficulty = (values, goal) => {
    const solutions = solve24(values, goal)
    const SolutionDificulty = []

    if (solutions.length === 0) {
        return 0
    } else {
        solutions.forEach(solution => {
            const addCount = solution.match(additon) || []
            const subCount = solution.match(subtraction) || []
            const mulCount = solution.match(multiplacation)  || []
            const divCount = solution.match(divison)  || []

            const difficulty = (addCount.length * 1) + (subCount.length * 2)
                               + (mulCount.length * 3) + (divCount.length * 4)

            SolutionDificulty.push(difficulty)
        });
        return Math.min(...SolutionDificulty);
    }

}

class Combination {
    constructor(values) {
        this.values = values
        this.difficulty = calcDifficulty(values, 24)
    }
}


class CardCombination {
    constructor() {
        this.combinations = []
    }

    generate = () => {
        const combValues = [1, 1, 1, 1]
        do {
            //console.log(combValues)
            const combination =  new Combination([...combValues])
            if (combination.difficulty !== 0) {
                this.combinations.push(combination)
            }
            ++combValues[3]
            for (let i = 4; i > 0; i--) {
                if (combValues[i] > 10) {
                    combValues[i - 1] = combValues[i - 1] + 1
                    for (let j = 3; j >= i; j--) {
                        combValues[j] = combValues[i - 1]
                    }
                }
            }
        } while (combValues[0] <= 10)
        return this.combinations
    }

}

export {
    CardCombination
}