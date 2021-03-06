// main libary
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// css
import '../App.css';
import 'antd/dist/antd.css'
import 'bootstrap/dist/css/bootstrap.min.css';

// component
import { Upload, Modal, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { Typography } from 'antd';
import { Card } from 'antd';
import { Table, Tag, Space } from 'antd';

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

const Home = () => {

  const [PreviewVisible, setPreviewVisible] = useState(false)
  const [PreviewImage, setPreviewImage] = useState('')
  const [PreviewTitle, setPreviewTitle] = useState('')
  const [FileList, setFileList] = useState([])

  const [resultImage, setResultImage] = useState({name:null})
  const [list,setList] = useState([])

  const { Title } = Typography;

  const handleCancel = () => {
    setPreviewVisible(false);
  }

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPreviewImage(file.url || file.preview)
    setPreviewVisible(true)
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1))
  }

  const handleChange = (FileList) => {
    setFileList(FileList.fileList);
  }

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const [progress, setProgress] = useState(0);

  const uploadImage = async options => {
    
    // setResultImage('')

    const { onSuccess, onError, file, onProgress } = options;

    const fmData = new FormData();
    const config = {
      headers: { "content-type": "multipart/form-data" },
      onUploadProgress: event => {
        const percent = Math.floor((event.loaded / event.total) * 100);
        setProgress(percent);
        if (percent === 100) {
          setTimeout(() => setProgress(0), 1000);
        }
        onProgress({ percent: (event.loaded / event.total) * 100 });
      }
    };
    fmData.append("image", file);
    console.log(fmData)
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/uploadImage",
        fmData,
        config
      );
      
      console.log(res.data.props)
      setResultImage(res.data);
      console.log(resultImage)
      // setResultImage(prevState => [...prevState,res.data] );
      onSuccess("Ok");
      console.log("server res: ", res);
    } catch (err) {
      console.log("Eroor: ", err);
      // const error = new Error("Some error");
      onError({ err });
    }

    // setResultImage(prevState => [...prevState,{}] );
  };

  useEffect(()=>{
    setList(prevState => [...prevState,resultImage])
    console.log(list.length)
    console.log(list)
  },[resultImage])

  const columns = [
    {
      title: 'Image Name',
      dataIndex: 'name',
    },
    {
      title: 'Result',
      dataIndex: 'result',
    },
    {
      title: 'Probability',
      dataIndex: 'props',
    },
    {
      title: 'Probability Average Ensemble',
      dataIndex: 'avg',
    },
    {
      title: 'Probability Weighted Average Ensemble',
      dataIndex: 'wei',
    },
  ];

  const divStyle = {
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    height:'40vh',
    // textAlign: 'left',
    paddingLeft:'10vh',
    paddingTop:'10vh'
  };

  return (
    <div style={{ minHeight:'900px'}}>

      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand >PCa-Project</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link >About</Nav.Link>
            <Nav.Link >Dataset</Nav.Link>
            <Nav.Link >Upload</Nav.Link>
            <Nav.Link >Contact</Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Container>
        {/* <br/> */}
        <div style={divStyle}>
          <h3 style={{ color:'white' }}>There are 5 pretrained models that are used</h3><br/>
          <h5 style={{ color:'white' }}>
            InceptionResNetV2<br/>
            InceptionV3 <br/>
            ResNet50V2 <br/>
            ResNet50 <br/>
            Xception
          </h5>
        </div>
        <br/>
        <Upload
          // action="http://127.0.0.1:8000/api/uploadImage"
          customRequest={uploadImage}
          listType="picture-card"
          fileList={FileList}
          onPreview={handlePreview}
          onChange={handleChange}
          multiple={true}
          size
        >
          {FileList.length >= 100 ? null : uploadButton}
        </Upload>

        <br/><br/>
        <Table columns={columns} dataSource={list.filter(item => item.name != null)} />

        <Modal
          visible={PreviewVisible}
          title={PreviewTitle}
          footer={null}
          onCancel={handleCancel}
        >
          <img alt="example" style={{ width: '100%' }} src={PreviewImage} />
        </Modal>
      </Container>
    </div>
  );

}

export default (Home);
