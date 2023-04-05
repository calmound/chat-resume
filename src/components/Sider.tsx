import { TECH_STACKS } from '@/constants';
import { QueryType } from '@/type';
import {
  Button,
  Checkbox,
  Form,
  Input,
  InputNumber,
  message,
  Radio,
  Select,
} from 'antd';
import dayjs from 'dayjs';
import Image from 'next/image';
import styles from './Sider.module.scss';

const Option = Select.Option;
export default function Sider({
  onSend,
  loading,
}: {
  onSend: (values: QueryType) => Promise<void>;
  loading: boolean;
}) {
  const handleFinish = (values: QueryType) => {
    const limitFetch = JSON.parse(localStorage.getItem('limitFetch') || '{}');
    // 在一天请求次数大于10次
    if (
      limitFetch?.count >= 10 &&
      dayjs().diff(dayjs(limitFetch.day), 'days') < 1
    ) {
      return message.warning('次数限制，明天再尝试');
    } else {
      localStorage.setItem(
        'limitFetch',
        JSON.stringify({
          day: dayjs().valueOf(),
          count: (limitFetch?.count || 0) + 1,
        })
      );
    }
    onSend(values);
  };

  return (
    <div className={styles.sider}>
      <div className={styles.title}>ChatResume</div>
      <div className={styles.desc}>创建你自己的简历</div>
      <div className={styles.tips1}>
        有问题或者需要免费点评简历，微信: sanmu1598
      </div>
      <Image
        className={styles.img}
        src="/wechat.png"
        width={100}
        alt=""
        height={100}
      />
      <div className={styles.tips1}>key的使用存在一定费用，限制了次数。</div>
      <div className={styles.tips1}>
        若一直无法返回结果，则表明限流。收藏本站在低峰使用。
      </div>
      <div className={styles.tips2}>
        可以通过右上角设置自己的key，不限制使用次数。
      </div>
      <Form onFinish={handleFinish} layout="vertical" size="small">
        <Form.Item
          name="title"
          label="项目名称"
          rules={[{ required: true, message: '请输入标题' }]}
        >
          <Input placeholder="输入你的项目名称" />
        </Form.Item>
        <Form.Item name="isNeedTitle" label="是否需要别名">
          <Radio.Group defaultValue="否">
            <Radio value="是">是</Radio>
            <Radio value="否">否</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="year" label="工作经验">
          <InputNumber placeholder="输入你希望的年限" />
        </Form.Item>
        <Form.Item
          name="techStacks"
          label="技术栈"
          rules={[{ required: true, message: '请选择技术栈' }]}
        >
          <Select
            mode="tags"
            placeholder="选择你项目技术栈"
            maxTagCount={5}
            filterOption={(inputValue: string, option: { value: string }) => {
              return (option?.value as string)
                .toLowerCase()
                .includes(inputValue.toLowerCase());
            }}
          >
            {TECH_STACKS.map((stack) => (
              <Option key={stack} value={stack}>
                {stack}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="business" label="业务方向">
          <Input placeholder="输入你的业务" />
        </Form.Item>
        <Button
          loading={loading}
          htmlType="submit"
          size="middle"
          className={styles.button}
        >
          生成
        </Button>
      </Form>
    </div>
  );
}
