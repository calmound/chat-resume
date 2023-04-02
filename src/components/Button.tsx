import styles from './Button.module.scss'
interface ButtonProps {
  text: string
}

export default function Button({ text }: ButtonProps) {
  return <div className={styles.button}>{text}</div>
}