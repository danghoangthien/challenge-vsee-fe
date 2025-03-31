import api from './api';

export interface ExaminationDetail {
  examination_id: number;
  provider_name: string;
  provider_id: number;
  status: 'in_progress' | 'completed';
  started_at: string;
  duration: string;
}

class ExaminationService {
  async getVisitorExamination(): Promise<ExaminationDetail | null> {
    try {
      const response = await api.get('/visitor/examination/detail');
      return response.data;
    } catch (error) {
      if ((error as any)?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}

export default new ExaminationService(); 