import styled from "styled-components";
import { getHorizontalGap, getVerticalGap } from "../../styles";
import Select from "react-select";
import Icon from "../Icon/Icon";
import IconOption from "./IconOption";
import ValueOption from "./ValueOption";

const Root = styled.div`
  display: flex;
  justify-content: space-between;
  ${getHorizontalGap("20px")};
  padding: 10px;
`;

const TransferChainContainer = styled.div`
  display: flex;
  flex-direction: column;
  ${getVerticalGap("5px")};
  width: 100%;
`;

const StyledSelect = styled(Select)`
  width: 100%;
`;

const TransferLabel = styled.div`
font-weight: 700;
font-size: ${({ theme }) => theme.heading.md}
color: ${({ theme }) => theme.secondaryColor};
`;

const TransferArrowContainer = styled.div`
  display: flex;
  align-items: center;
`;

const IconArrowRight = styled(Icon)`
  margin-top: 20px;
  height: 25px;
  width: 25px;
`;

type Props = {
  chainFrom: string;
  chainTo: string;
  onSelectChainFrom: (option: any) => void;
  onSelectChainTo: (option: any) => void;
};
const TransferChainSelects = ({
  onSelectChainFrom,
  onSelectChainTo,
}: Props) => {
  const chainsFrom = [
    {
      label: "Ethereum",
      value: "0",
      icon: <Icon name="ethereum" size="20px"/>,
    },
    {
      label: "Polygon",
      value: "1",
      icon: <Icon name="polygon" size="20px"/>,
    },
  ];
  const chainsTo = [
    { label: "Ethereum", value: "0", icon: <Icon name="ethereum" size="20px"/> },
    { label: "Polygon", value: "1", icon: <Icon name="polygon" size="20px"/> },
  ];

  return (
    <Root>
      <TransferChainContainer>
        <TransferLabel>Transfer from</TransferLabel>
        <StyledSelect
          options={chainsFrom}
          isClearable
          placeholder={null}
          onChange={onSelectChainFrom}
          components={{ Option: IconOption, SingleValue: ValueOption }}
        />
      </TransferChainContainer>
      <TransferArrowContainer>
        <IconArrowRight name="arrowRight" />
      </TransferArrowContainer>
      <TransferChainContainer>
        <TransferLabel>Transfer to</TransferLabel>
        <StyledSelect
          options={chainsTo}
          placeholder={null}
          isClearable
          onChange={onSelectChainTo}
          components={{ Option: IconOption, SingleValue: ValueOption  }}
        />
      </TransferChainContainer>
    </Root>
  );
};

export default TransferChainSelects;
