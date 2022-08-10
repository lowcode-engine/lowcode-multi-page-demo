import { PageSchema } from '@alilc/lowcode-types';
import { SelectInfo } from 'rc-menu/lib/interface';
import { useEffect, useState, useRef } from 'react';
import { project, config, material } from '@alilc/lowcode-engine';
import {
  Row,
  Col,
  Spin,
  Form,
  Menu,
  Input,
  Modal,
  Space,
  Button,
  Upload,
  Divider,
  message
} from 'antd';
import { FileAddOutlined, ExportOutlined, ImportOutlined, DeleteTwoTone } from '@ant-design/icons'

import {
  getProjectSchemaFromLocalStorage,
  saveSchema,
} from '../../../universal/utils';

const baseUrl = 'https://3010-blueju-lowcodemultipage-tqz8gsmq870.ws-us59.gitpod.io'

export default (props: any) => {
  const [createPageForm] = Form.useForm();
  const [pages, setPages] = useState<PageSchema[]>([]);
  const [currentPage, setCurrentPage] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    getPages();
  }, []);

  /**
   * 获取所有页面
   */
  const getPages = () => {
    fetch(`${baseUrl}/pages`, { method: 'GET' })
      .then((res) => res.json())
      .then((resJson: {
        code: 0,
        data: PageSchema[]
      }) => {
        setPages(resJson.data);
        // 默认选择第一个页面
        setCurrentPage(resJson.data[0].fileName)
      })
  };

  /**
   * 通过页面文件名删除指定页面
   */
  const deletePageByFileName = (fileName: string) => {
    fetch(`${baseUrl}/page/${fileName}`, { method: 'DELETE' })
      .then(res => res.json())
      .then((resJson: {
        code: 0 | -1,
        msg: string
      }) => {
        if (resJson.code === 0) {
          message.success(resJson.msg)
          getPages();
        } else {
          message.error(resJson.msg)
        }
      })
  };

  const createPage = ({ pageId }) => {
    const defaultProjectSchema = require('../schema.json');
    project.removeDocument(project.currentDocument as any);
    project.openDocument(defaultProjectSchema);
    config.set('currentPage', pageId);
    setCurrentPage(pageId);
    saveSchema();
    setVisible(false);
    getPages();
    createPageForm.resetFields();
  };

  /** 导出 */
  const exportAllPageSchema = () => {
    const blob = new window.Blob([JSON.stringify(pages)], {
      type: 'application/json;charset=UTF-8',
    });
    const downloadUrl = URL.createObjectURL(blob);
    const downloadLinkDOM = document.createElement('a');
    downloadLinkDOM.href = downloadUrl;
    downloadLinkDOM.download = 'schema.json';
    downloadLinkDOM.click();
    URL.revokeObjectURL(downloadUrl);
  };

  /** 导入 */
  const importAllPageSchema = (info) => {
    if (info.file.status === 'done') {
      const file = info.file.originFileObj;
      const fileReader = new FileReader();
      fileReader.readAsText(file);
      fileReader.onload = () => {
        const allPageSchema = JSON.parse(fileReader.result);
        let pageId;
        allPageSchema.forEach((item: string[], index: number) => {
          if (index === 0) pageId = item[0].split(':')[0];
          localStorage.setItem(item[0], item[1]);
        });
        message.success('导入成功');
        getPages();
        setCurrentPage(pageId);
        config.set('currentPage', pageId);
        saveSchema();
      };
    }
  };

  const handleSelect = ({ selectedKeys }: SelectInfo) => {
    const pageId = selectedKeys[0];
    setCurrentPage(pageId);
    config.set('currentPage', pageId);
    const schema = pages.find(item => item.fileName === pageId);
    project.removeDocument(project.currentDocument as any);
    project.openDocument(schema);
  };

  /** 开启/关闭新建页面弹窗 */
  const openCreatePageModal = () => setVisible(true);
  const closeCreatePageModal = () => setVisible(false);


  return (
    <>
      <Row gutter={8} style={{ paddingLeft: 14 }}>
        <Col>
          <Button
            size="small"
            icon={<FileAddOutlined />}
            onClick={openCreatePageModal}
          >
            新建
          </Button>
        </Col>
        <Col>
          <Button
            size="small"
            icon={<ExportOutlined />}
            onClick={exportAllPageSchema}

          >
            导出
          </Button>
        </Col>
        <Col>
          <Upload
            showUploadList={false}
            onChange={importAllPageSchema}
          // style={{ display: 'block' }}
          >
            <Button
              size="small"
              icon={<ImportOutlined />}
            >
              导入
            </Button>
          </Upload>
        </Col>
      </Row>
      <Divider style={{ marginTop: 14, marginBottom: 0 }} />
      <Menu
        mode="inline"
        onSelect={handleSelect}
        selectedKeys={[currentPage]}
      >
        {pages.length
          ? pages.map(page => (
            <Menu.Item key={page.fileName} style={{ margin: '0 0' }}>
              <Row justify='space-between' align='middle'>
                <Col>{page.fileName}</Col>
                <Col>
                  <DeleteTwoTone onClick={() => deletePageByFileName(page.fileName)} />
                </Col>
              </Row>
            </Menu.Item>
          ))
          : null}
      </Menu>

      <Modal
        title="新建页面"
        visible={visible}
        footer={null}
        onCancel={closeCreatePageModal}
      >
        <Form
          form={createPageForm}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          onFinish={createPage}
          initialValues={{
            pageId: '',
            pageName: '',
          }}
        >
          <Form.Item
            name="pageId"
            label="页面ID"
            rules={[{ required: true, message: '请输入页面ID' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="pageName"
            label="页面名称"
            rules={[{ required: true, message: '请输入页面名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 6 }}>
            <Space size='small'>
              <Button
                type="primary"
                htmlType="submit"
              >
                创建
              </Button>
              <Button
                htmlType="reset"
              >
                重置
              </Button>
            </Space>

          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};


