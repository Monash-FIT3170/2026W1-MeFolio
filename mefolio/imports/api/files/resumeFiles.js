import { FilesCollection } from 'meteor/ostrio:files';

export const ResumeFiles = new FilesCollection({
  collectionName: 'resumeFiles',
  storagePath: 'uploads/resumes',
  downloadRoute: '/cdn/storage',
  public: true,
  allowClientCode: false,
  onBeforeUpload(file) {
    // PDF only
    if (file.extension !== 'pdf') {
      return 'Only PDF files are allowed';
    }

    // Max size 5MB
    if (file.size > 5 * 1024 * 1024) {
      return 'File too large';
    }

    return true;
  },
});