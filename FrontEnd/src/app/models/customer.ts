/* tslint:disable */
/* eslint-disable */
import { ChurnPrediction } from './churn-prediction';
export interface Customer {
  customerID?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  gender?: string;
  SeniorCitizen?: number;
  Partner?: string;
  Dependents?: string;
  tenure?: number;
  PhoneService?: string;
  MultipleLines?: string;
  InternetService?: string;
  OnlineSecurity?: string;
  OnlineBackup?: string;
  DeviceProtection?: string;
  TechSupport?: string;
  StreamingTV?: string;
  StreamingMovies?: string;
  Contract?: string;
  PaperlessBilling?: string;
  PaymentMethod?: string;
  MonthlyCharges?: number;
  TotalCharges?: number;
  churnPrediction?: ChurnPrediction;
}
