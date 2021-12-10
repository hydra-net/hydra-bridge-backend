import  icons  from "./components/Icon";

export interface IApiResponse {
    data?: any;
    status?: number;
    errorMsg?: any;
    message?: string;
  }


  export interface ISelectOption {
    label: string;
    value: string;
  }

  export interface IStyleableProps {
    style?: any;
    className?: string;
  }
  
export type IconKeys = keyof typeof icons;