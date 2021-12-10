import styled from "styled-components";
import spinnerIcon from "../../assets/spinner-icon.svg";
import { IStyleableProps } from "../commonTypes";

const Spinner = styled.img`
  margin: 0 auto;
  animation: load3 1.4s infinite linear;
  max-width: 30px;

  @keyframes load3 {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
`;

const LoadingSpinner = (props: IStyleableProps) => {
  return <Spinner src={spinnerIcon} {...props} />;
};

export default LoadingSpinner;
