/* tslint:disable */
/* eslint-disable */
import { ChurnPrediction } from './churn-prediction';
export interface Customer {
  Contract?: string;
  Dependents?: string;
  DeviceProtection?: string;
  InternetService?: string;
  MonthlyCharges?: number;
  MultipleLines?: string;
  OnlineBackup?: string;
  OnlineSecurity?: string;
  PaperlessBilling?: string;
  Partner?: string;
  PaymentMethod?: string;
  PhoneService?: string;
  SeniorCitizen?: number;
  StreamingMovies?: string;
  StreamingTV?: string;
  TechSupport?: string;
  TotalCharges?: number;
  churnPrediction?: ChurnPrediction;
  customerID?: number;
  gender?: string;
  tenure?: number;
}
