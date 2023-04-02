import Head from 'next/head';
import {
  useEffect,
  useRef,
  useState,
} from 'react';
import ReactMarkdown from 'react-markdown';
import RemarkMath from 'remark-math';
import RehypeKatex from 'rehype-katex';
import RemarkGfm from 'remark-gfm';
import RehypePrsim from 'rehype-prism-plus';
import styles from './index.module.scss';
import { Button, Form } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import SettingModal from '@/components/SettingModal';
import Loading from '@/components/Loading';
import Sider from '@/components/Sider';

import 'katex/dist/katex.min.css';

const TIME_OUT = 3000;
enum ROLE {
  USER = 'user',
  Assistant = 'assistant',
}
interface MessageType {
  role: ROLE;
  content: string;
}

const useLoading = () => {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
  }, []);

  return loading;
};

export function PreCode(props: { children: any }) {
  const ref = useRef<HTMLPreElement>(null);

  return (
    <pre ref={ref}>
      <span
        className="copy-code-button"
        onClick={() => {
          if (ref.current) {
            const code = ref.current.innerText;
            // copyToClipboard(code);
          }
        }}
      ></span>
      {props.children}
    </pre>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(false)
  const [settingShow, setSetShow] = useState(false);
  const [key, setKey] = useState('');
  const [form] = Form.useForm();

  const pageLoading = !useLoading();

  const handleSend = async (values) => {
    setLoading(true)
    const controller = new AbortController();

    try {
      const { techStacks, title, business, year, isNeedTitle } = values;

      // const content = `请帮我把以下的关键内容填充为一篇简历的技术项目，需要介绍项目概览，项目背景项目名称需要在起一个符合场景的名字，项目概览需要详细不少于100字。技术实现需要包含具体的技术和业务的结合不少于30个方向，每个点都需要不低于30字。项目难点需要包含通过什么技术，解决什么问题，得到什么收货。尽量避免在回答内容中出现可能在中国是敏感的内容，用markdown格式以分点叙述的形式输出: ${title}，${(
      //   techStacks || []
      // ).join('和')}`;

      // const content = `请帮我把以下的关键内容填充为一篇简历的技术项目，项目名称是${title}，在起一个别名。技术栈是${techStacks}。需要介绍项目概览，项目概览不少于100字。技术实现需要告诉我用了什么技术栈，实现了什么功能点，希望比较详细，不少于15个方向，每条不低于40字。项目难点需要包含通过什么技术栈，解决什么问题或者实现了什么功能，帮忙整理5个。尽量避免在回答内容中出现可能在中国是敏感的内容，用markdown格式以分点叙述的形式输出`;
      // const content = `请帮我把以下的关键内容填充为一篇简历的技术项目，项目名称是${title}，在帮我想一个和业务结合的其他名字。技术栈是${techStacks}。需要介绍项目概览，项目概览不少于100字。需要介绍10个功能点。需要告诉我可以用什么技术实现什么功能，希望比较详细，不少于15个方向，每条不低于40字。项目难点需要包含通过什么技术栈，解决什么问题或者实现了什么功能，帮忙整理5个。尽量避免在回答内容中出现可能在中国是敏感的内容，用markdown格式以分点叙述的形式输出`;
      // const content = `请帮我把以下的关键内容填充为一篇简历的技术项目，项目名称是${title}，业务方向是${business}，在帮我想3个结合业务的其他中文名字。技术栈是${techStacks}。需要介绍项目概览，项目概览不少于100字。需要介绍10个功能点。需要告诉我可以用什么技术实现什么功能，希望比较详细，不少于10个方向。项目难点需要包含通过什么技术栈，解决什么问题或者实现了什么功能，帮忙整理5个，简历希望符合${year}年工作经验。尽量避免在回答内容中出现可能在中国是敏感的内容，用markdown格式以分点叙述的形式输出`;

      let content = `请帮我把以下的关键内容填充为一篇简历的技术项目，项目名称是${title}`
      if (business) {
        content += `，业务方向是${business}`
      }
      if (isNeedTitle) {
        content += `，在帮我想3个结合业务的其他中文名字`
      }
      content += `。技术栈是${techStacks}。需要介绍项目概览，项目概览不少于100字。需要介绍10个功能点。需要告诉我可以用什么技术实现什么功能，希望比较详细，不少于10个方向。项目难点需要包含通过什么技术栈，解决什么问题或者实现了什么功能，帮忙整理5个`
      if (year) {
        content += `，简历希望符合${year}年工作经验`
      }
      content += `。尽量避免在回答内容中出现可能在中国是敏感的内容，用markdown格式以分点叙述的形式输出。`

      const payload = {
        messages: [
          {
            role: ROLE.USER,
            content,
          },
        ],
        stream: true,
        max_tokens: 3000,
        n: 2,
        temperature: 0.6,
        frequency_penalty: 1.5,
        presence_penalty: 1.5
      };
      const res = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      let responseText = '';

      const finish = () => {
        // options?.onMessage(responseText, true);
        // controller.abort();
        setLoading(false)
      };

      if (res.ok) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        // options?.onController?.(controller);
        while (true) {
          // handle time out, will stop if no response in 10 secs
          const resTimeoutId = setTimeout(() => finish(), TIME_OUT);
          const content = await reader?.read();
          clearTimeout(resTimeoutId);
          const text = decoder.decode(content?.value);
          responseText += text;
          const done = !content || content.done;

          const message = {
            role: ROLE.Assistant,
            content: responseText,
          };

          setMessages([message]);
          if (done) {
            break;
          }
        }

        finish();
      } else if (res.status === 401) {
        console.error('Anauthorized');
        // responseText = Locale.Error.Unauthorized;
        finish();
      } else {
        console.error('Stream Error');
        // options?.onError(new Error("Stream Error"));
      }
    } catch (err) {
      console.error('NetWork Error', err);
      // options?.onError(err as Error);
    }
  };

  if (pageLoading) {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <title></title>
        <meta name="description" content="ChatGPT Robot" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className={styles.main}>
        <Sider onSend={handleSend} loading={loading} />
        <div className={styles['content']}>
          <div className={styles['header']}>
            ChatResume
            <Button
              className={styles['setting']}
              icon={<SettingOutlined />}
              onClick={() => {
                setSetShow(true);
              }}
            />
          </div>
          {messages.map((message, i) => {
            return (
              <div key={i} className={styles['message']}>
                <div key={i} className="markdown-body">
                  <ReactMarkdown
                    remarkPlugins={[RemarkMath, RemarkGfm]}
                    rehypePlugins={[
                      RehypeKatex,
                      [RehypePrsim, { ignoreMissing: true }],
                    ]}
                    components={{
                      pre: PreCode,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            );
          }
          )}
        </div>
        {settingShow && (
          <SettingModal setSetShow={setSetShow} setKey={setKey} />
        )}
      </main>
    </>
  );
}
