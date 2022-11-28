import styles from '/styles/Game.module.css';

export default function Leaderboard(props) {
    
    const userList = props.userList

    const sortUsers = () => {
        userList.sort((a, b) => b.score - a.score)
    }

    return (
        <table>
            <thead>
                <tr>
                    <th>player</th>
                    <th>score</th>
                </tr>
            </thead>
            {sortUsers()}
            <tbody>
            {userList.map((user) => {
                return (
                    <tr key={user.id}>
                        <td className={styles.username}>{user.username} {user.submitted ? '✓' : ''}</td>
                        <td className={styles.score}>{user.score}</td>
                    </tr>
                )})
            }
            </tbody>

        </table>
    )
}