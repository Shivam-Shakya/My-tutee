import React, { useEffect, useState } from 'react';
import { FiUpload, FiVideo, FiFileText, FiClock, FiEdit, FiPlus, FiTrash2 } from 'react-icons/fi';

const TeacherUploadLectureSection = ({
  onBack,
  teacherLectures,
  handleEditLecture,
  handleDeleteLecture,
  lectureForm,
  lectureError,
  lectureSuccess,
  lectureLoading,
  lectureSubmitting,
  handleLectureSubmit,
  handleLectureChange,
  handleLectureFileChange,
  subjectOptions,
  classLevelOptions,
  videoFileInputRef,
  materialFileInputRef,
  resetLectureForm,
  buildAssetUrl,
  formatFileSize
}) => {
  const [isLectureFormVisible, setIsLectureFormVisible] = useState(false);

  useEffect(() => {
    if (lectureForm.editingId) {
      setIsLectureFormVisible(true);
    }
  }, [lectureForm.editingId]);

  const handleToggleLectureForm = () => {
    setIsLectureFormVisible((prev) => {
      const nextVisible = !prev;
      if (!nextVisible && lectureForm.editingId) {
        resetLectureForm();
      }
      return nextVisible;
    });
  };

  const handleEditLectureClick = (lecture) => {
    setIsLectureFormVisible(true);
    handleEditLecture(lecture);
  };

  const handleSubmitLecture = async (event) => {
    const result = await handleLectureSubmit(event);
    if (result?.success) {
      setIsLectureFormVisible(false);
    }
  };

  return (
    <div className="page-section">
      <div className="section-header">
        <h2 className="page-title">Upload Lecture</h2>
        <button className="back-btn" onClick={onBack}>← Back to Dashboard</button>
      </div>

      <div className="section-form-toggle-row">
        <button
          type="button"
          className={`section-form-toggle-btn ${isLectureFormVisible ? 'active' : ''}`}
          onClick={handleToggleLectureForm}
        >
          <FiPlus /> {isLectureFormVisible ? 'Hide Lecture Form' : 'Upload Lecture'}
        </button>
      </div>

      {isLectureFormVisible && (
        <div className="form-card section-top-form-card">
          <h3 className="form-subtitle">{lectureForm.editingId ? 'Edit Lecture' : 'Upload New Lecture'}</h3>
          {lectureError && <div className="error-message">{lectureError}</div>}
          {lectureSuccess && <div className="success-message">{lectureSuccess}</div>}
          {lectureLoading && <div className="info-message">Loading lectures...</div>}

          <form onSubmit={handleSubmitLecture}>
            <div className="form-row">
              <div className="form-group">
                <label>Subject</label>
                <select name="subject" value={lectureForm.subject} onChange={handleLectureChange} required>
                  <option value="">Choose a subject</option>
                  {subjectOptions.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Class Level</label>
                <select name="classLevel" value={lectureForm.classLevel} onChange={handleLectureChange} required>
                  <option value="">Choose class level</option>
                  {classLevelOptions.map((level) => (
                    <option key={level} value={level}>
                      {level === 'Graduation' || level === 'Post Graduation' ? level : `Class ${level}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Lecture Title</label>
              <input
                type="text"
                name="title"
                value={lectureForm.title}
                onChange={handleLectureChange}
                placeholder="Enter lecture title"
                required
              />
            </div>

            <div className="form-group">
              <label>Lecture Description</label>
              <textarea
                rows="4"
                name="description"
                value={lectureForm.description}
                onChange={handleLectureChange}
                placeholder="Brief description of the lecture"
              ></textarea>
            </div>

            <div className="form-group">
              <label>Video Source</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input type="radio" name="videoType" value="file" checked={lectureForm.videoType === 'file'} onChange={handleLectureChange} /> Video File
                </label>
                <label className="radio-label">
                  <input type="radio" name="videoType" value="link" checked={lectureForm.videoType === 'link'} onChange={handleLectureChange} /> YouTube / Meeting Recording Link
                </label>
              </div>
            </div>

            {lectureForm.videoType === 'file' ? (
              <div className="form-group">
                <label>{lectureForm.editingId ? 'Replace Video File (optional)' : 'Upload Video File'}</label>
                <div className="file-upload-area compact">
                  <FiUpload className="upload-icon" />
                  <p>{lectureForm.videoFile ? lectureForm.videoFile.name : 'Select MP4, WebM, MOV, AVI, or MKV file'}</p>
                  {lectureForm.existingVideoName && !lectureForm.videoFile && (
                    <span className="selected-file-note">Current file: {lectureForm.existingVideoName}</span>
                  )}
                  <input
                    ref={videoFileInputRef}
                    type="file"
                    name="videoFile"
                    className="file-input"
                    accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska"
                    onChange={handleLectureFileChange}
                    required={lectureForm.videoType === 'file' && !lectureForm.editingId && !lectureForm.existingVideoName}
                  />
                </div>
                {lectureForm.existingVideoUrl && !lectureForm.videoFile && (
                  <button
                    type="button"
                    className="resource-link-btn inline"
                    onClick={() => window.open(buildAssetUrl(lectureForm.existingVideoUrl), '_blank', 'noopener,noreferrer')}
                  >
                    Preview Current Video
                  </button>
                )}
              </div>
            ) : (
              <div className="form-group">
                <label>Video Link</label>
                <input
                  type="url"
                  name="videoLink"
                  value={lectureForm.videoLink}
                  onChange={handleLectureChange}
                  placeholder="https://youtube.com/watch?v=..."
                  required={lectureForm.videoType === 'link'}
                />
              </div>
            )}

            <div className="form-group">
              <label>{lectureForm.editingId ? 'Replace Supporting Materials (optional)' : 'Supporting Materials'}</label>
              <div className="file-upload-area compact materials">
                <FiFileText className="upload-icon" />
                <p>
                  {lectureForm.materialFiles.length > 0
                    ? `${lectureForm.materialFiles.length} file${lectureForm.materialFiles.length === 1 ? '' : 's'} selected`
                    : 'Upload PDFs, notes, documents, or presentations'}
                </p>
                <input
                  ref={materialFileInputRef}
                  type="file"
                  name="materialFiles"
                  className="file-input"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  multiple
                  onChange={handleLectureFileChange}
                />
              </div>

              {lectureForm.existingMaterials.length > 0 && (
                <div className="existing-materials-block">
                  <div className="existing-materials-header">
                    <span>Current materials</span>
                    <label className="checkbox-label">
                      <input type="checkbox" name="removeMaterials" checked={lectureForm.removeMaterials} onChange={handleLectureChange} /> Remove current materials
                    </label>
                  </div>
                  <div className="materials-chip-list">
                    {lectureForm.existingMaterials.map((material) => (
                      <a
                        key={material.fileName}
                        className="material-chip"
                        href={buildAssetUrl(material.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        download
                      >
                        {material.originalName} ({formatFileSize(material.size)})
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  if (lectureForm.editingId) {
                    resetLectureForm();
                  }
                  setIsLectureFormVisible(false);
                }}
              >
                {lectureForm.editingId ? 'Cancel Edit' : 'Close'}
              </button>
              <button type="submit" className="btn-primary" disabled={lectureSubmitting}>
                {lectureSubmitting ? (lectureForm.editingId ? 'Saving...' : 'Uploading...') : (lectureForm.editingId ? 'Save Lecture' : 'Upload Lecture')}
              </button>
            </div>
          </form>
        </div>
      )}

      {teacherLectures.length > 0 && (
        <div className="existing-lectures">
          <div className="section-header compact">
            <h3 className="section-subtitle">Uploaded Lectures</h3>
            <span className="lecture-count-tag">{teacherLectures.length} total</span>
          </div>
          <div className="lectures-management-grid">
            {teacherLectures.map((lecture) => (
              <div key={lecture._id} className="lecture-management-card">
                <div className="lecture-management-header">
                  <div>
                    <h4>{lecture.title}</h4>
                    <p>{lecture.subject} • {lecture.classLevel === 'Graduation' || lecture.classLevel === 'Post Graduation' ? lecture.classLevel : `Class ${lecture.classLevel}`}</p>
                  </div>
                  <span className={`lecture-source-badge ${lecture.videoType}`}>
                    {lecture.videoType === 'file' ? 'Video File' : 'Video Link'}
                  </span>
                </div>
                {lecture.description && (
                  <p className="lecture-management-description">{lecture.description}</p>
                )}
                <div className="lecture-management-meta">
                  <span><FiVideo /> {lecture.videoType === 'file' ? (lecture.videoFile?.originalName || 'Uploaded video') : 'External recording link'}</span>
                  <span><FiFileText /> {lecture.materials?.length || 0} material{lecture.materials?.length === 1 ? '' : 's'}</span>
                  <span><FiClock /> {new Date(lecture.createdAt).toLocaleDateString()}</span>
                </div>
                {(lecture.videoType === 'link' || lecture.videoFile?.fileUrl || lecture.materials?.length > 0) && (
                  <div className="lecture-resource-links">
                    {(lecture.videoType === 'link' || lecture.videoFile?.fileUrl) && (
                      <button
                        type="button"
                        className="resource-link-btn"
                        onClick={() => window.open(lecture.videoType === 'link' ? lecture.videoLink : buildAssetUrl(lecture.videoFile?.fileUrl), '_blank', 'noopener,noreferrer')}
                      >
                        Open Video
                      </button>
                    )}
                    {lecture.materials?.map((material) => (
                      <a
                        key={material.fileName}
                        className="resource-link-btn secondary"
                        href={buildAssetUrl(material.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        download
                      >
                        {material.originalName}
                      </a>
                    ))}
                  </div>
                )}
                <div className="lecture-actions-row">
                  <button type="button" className="btn-small btn-edit" onClick={() => handleEditLectureClick(lecture)}>
                    <FiEdit /> Edit
                  </button>
                  <button type="button" className="btn-small btn-danger" onClick={() => handleDeleteLecture(lecture._id)}>
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherUploadLectureSection;
