import React, { useState, useEffect } from 'react';
import '../styles/About.css';
import { Row, Col, Button, Card, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { configureAWS, deleteImages, extractionValue } from '../components/common/aws/awsServices';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState([]);
  // 서버 API 주소를 저장
  const apiUrl = 'http://localhost:3300/profiles';
  const [profiles, setProfiles] = useState([]);
  const [file, setFile] = useState(null);
  const [newImage, setNewImage] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const response = await axios.get(apiUrl);
      setProfiles(response.data);
      setEditMode(Array(response.data.length).fill(false));
    }
    fetchData();
  }, []);

  // 서버에 변경 사항 저장
  const toggleEdit = async (index) => {
    if (editMode[index]) {
      await axios.put(`${apiUrl}/${profiles[index].id}`, profiles[index]);
    }
    const newEditMode = [...editMode];
    newEditMode[index] = !newEditMode[index];
    setEditMode(newEditMode);
  };

  // 프로필 수정
  const profileEdit = (index, field, value) => {
    setProfiles(profiles.map((profile, i) => {
      if (i === index) {
        return { ...profile, [field]: value };
      }
      return profile;
    }));
  };

  // 프로필 추가
  const addProfile = async () => {
    const newProfile = { name: '', image: newImage, description: '' };
    const response = await axios.post(apiUrl, newProfile);
    setProfiles([...profiles, response.data]);
    setEditMode([...editMode, true]);
    setNewImage(null);
  };s

  // 프로필 삭제
  const deleteProfile = async (index) => {
    await axios.delete(`${apiUrl}/${profiles[index].id}`);
    const newProfiles = profiles.filter((_, i) => i !== index);
    setProfiles(newProfiles);
    const newEditMode = editMode.filter((_, i) => i !== index);
    setEditMode(newEditMode);
  };

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute("accept", "image/*");
    input.click();
  
    input.onchange = async () => {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('image', file);
  
      try {
        const { imageURL } = await getImageUrl(formData, 'admin', 'images');
        setNewImage(imageURL);
      } catch (error) {
        console.log(error.message);
      }
    };
  }, []);

  // 프로필 페이지 렌더링
  return (
    <Card body className="about">
      {profiles.map((profile, index) => (
        <Row key={index}>
          <Col>
            <h2 className="text-center font-weight-bold">{profile.name}</h2>
            {editMode[index] ? (
              // 입력 폼
              <div>
                <input
                  type="text"
                  className="form-control mb-2"
                  value={profile.name}
                  onChange={(e) => profileEdit(index, 'name', e.target.value)}
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  value={profile.link}
                  onChange={(e) => profileEdit(index, 'link', e.target.value)}
                />
                <textarea
                  className="form-control mb-2"
                  value={profile.description}
                  onChange={(e) => profileEdit(index, 'description', e.target.value)}
                />
              </div>
            ) : (
              // 프로필 데이터를 렌더링
              <div>
                <img src={profile.image} alt={profile.name} className="img-fluid" style={{ display: 'flex', justifyContent: 'flex-end', width: '30%', height: '30%', objectFit: 'cover' }}/>
                <p>{profile.description}</p>
              </div>
            )}
            {/* 수정 및 삭제 버튼 */}
            <div className="text-center mt-4">
              <Button variant="primary" size="sm" onClick={() => toggleEdit(index)}>
                {editMode[index] ? '저장' : '수정'}
              </Button>
              <Button variant="danger" size="sm" onClick={() => deleteProfile(index)} className="ml-2">
                삭제
              </Button>
            </div>
          </Col>
        </Row>
      ))}
      {/* // 프로필 추가 버튼 */}
      <div className="text-center mt-4">
        <input type="file" onChange={imageHandler} />
        <Button variant="success" size="sm" onClick={addProfile}>
          프로필 추가
        </Button>
      </div>
    </Card>
  );
};

export default ProfilePage;
