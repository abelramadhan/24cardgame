import { useState } from "react";
import styles from '/styles/Game.module.css';

export default function Card(props) {

    const cssClass = (classesArr) => {
        let extraClasses = `${styles.card} `
        classesArr.forEach(className => {
            extraClasses += `${styles[className]} `
        });
        return extraClasses
    }

    return (
        <button onClick={props.onClick} className={cssClass(props.extraClass)}>
            <h1>{props.value}</h1>
        </button>
    )
    
}