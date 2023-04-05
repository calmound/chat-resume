import { Modal, Form, Input, message } from 'antd';
import Image from 'next/image';
import { Dispatch, SetStateAction } from 'react';

export default function QrCodeModal({
  setQrShow,
}: {
  setQrShow: Dispatch<SetStateAction<boolean>>;
}) {
  const [form] = Form.useForm();
  return (
    <Modal
      open
      title="获取验证码"
      onCancel={() => setQrShow(false)}
      onOk={() => {
        const resumeCode = form.getFieldValue('resumeCode');
        if (resumeCode === '123456') {
          localStorage.setItem('resumeCode', resumeCode);
          setQrShow(false);
          message.success('验证成功');
        } else {
          message.error('验证码错误');
        }
      }}
    >
      <div>关注公众号，回复简历，即可获取验证码，感谢。</div>
      <Image src="/qrcode.jpg" width={200} height={200} alt="qrcode" />
      <Form form={form}>
        <Form.Item label="验证码" name="resumeCode">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
