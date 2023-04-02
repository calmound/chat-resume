import 'normalize.css'
import 'antd/dist/reset.css';
import '@/styles/markdown.css'
import '@/styles/prism.css'
import '@/styles/global.scss'

import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}