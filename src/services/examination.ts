import api from './api';

export interface ExaminationDetail {
  examination_id: number;
  visitor_id: number;
  visitor_name: string;
  provider_id: number;
  provider_name: string;
  status: string;
  started_at: string;
  duration: string;
  reason: string;
}

interface ApiResponse<T> {
  data: T;
}

class ExaminationService {
  private static instance: ExaminationService;

  private constructor() {}

  static getInstance(): ExaminationService {
    if (!ExaminationService.instance) {
      ExaminationService.instance = new ExaminationService();
    }
    return ExaminationService.instance;
  }

  async getVisitorExamination(): Promise<ExaminationDetail | null> {
    try {
      const response = await api.get<ApiResponse<ExaminationDetail>>('/visitor/examination/detail');
      return response.data.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getProviderExamination(): Promise<ExaminationDetail | null> {
    try {
      const response = await api.get<ApiResponse<ExaminationDetail>>('/provider/examination/detail');
      return response.data.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}

export default ExaminationService.getInstance(); 