import { TECH_STACKS } from '@/constants';
import { QueryType } from '@/type';
import { Button, Form, Input, InputNumber, message, Radio, Select } from 'antd';
import dayjs from 'dayjs';
import { Dispatch, SetStateAction } from 'react';
import styles from './Sider.module.scss';

const Option = Select.Option;
export default function Sider({
  onSend,
  loading,
  setQrShow,
  hasKey,
}: {
  onSend: (values: QueryType) => Promise<void>;
  loading: boolean;
  setQrShow: Dispatch<SetStateAction<boolean>>;
  hasKey: boolean;
}) {
  const handleFinish = (values: QueryType) => {
    if (hasKey) {
      return onSend(values);
    }
    const limitFetch = JSON.parse(localStorage.getItem('limitFetch') || '{}');
    const resumeCode = localStorage.getItem('resumeCode');
    if (!resumeCode) setQrShow(true);

    const dateA = dayjs();
    const dateB = dayjs(limitFetch.day);
    const daysDiff = dayjs(dateA).diff(dayjs(dateB), 'day');

    // 天数大于1天或者次数小于10次都可以请求
    if (daysDiff >= 1) {
      localStorage.setItem(
        'limitFetch',
        JSON.stringify({
          day: dateA,
          count: 1,
        })
      );
    } else if (limitFetch?.count <= 3) {
      localStorage.setItem(
        'limitFetch',
        JSON.stringify({
          day: dateA,
          count: (limitFetch.count || 0) + 1,
        })
      );
    } else {
      // 天数小于10，次数大于10
      return message.warning('次数限制，明天再尝试');
    }
    onSend(values);
  };

  return (
    <div className={styles.sider}>
      <div className={styles.title}>ChatResume</div>
      <div className={styles.tips1}>
        若一直无法返回结果，则表明key的额度用完了或者需要科学上网。
      </div>
      <div className={styles.tips2}>
        为了延长key的使用时间，所以限制了使用频率。右上角设置自己的key则没有使用次数限制。
      </div>
      <Form
        onFinish={handleFinish}
        layout="vertical"
        size="middle"
        initialValues={{ isNeedTitle: '否' }}
      >
        <Form.Item
          name="title"
          label="项目名称"
          rules={[{ required: true, message: '请输入标题' }]}
        >
          <Input placeholder="输入你的项目名称" />
        </Form.Item>
        <Form.Item name="isNeedTitle" label="是否需要别名">
          <Radio.Group>
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
