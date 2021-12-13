import styled, { CSSProperties } from "styled-components";
import Icon from "../Icon/Icon";
import Select from "react-select";
import IconOption from "../Select/IconOption";
import ValueOption from "../Select/ValueOption";
import { getFlexCenter, getHorizontalGap } from "../../styles";

const Root = styled.div`
 
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  ${getHorizontalGap("10px")}
  ${getFlexCenter}
`;

const Label = styled.div`
font-weight: 700;
font-size: ${({ theme }) => theme.heading.xs};
color: ${({ theme }) => theme.secondaryColor};
`;

const StyledSelect = styled(Select)`
  width: 150px;
  border-radius: 10px;

  .send-asset-select__control {
    border-radius: 20px !important;
  }
`;

type Props = {
  onSelectAsset: (value: any) => void;
};
const AssetSelect = ({ onSelectAsset }: Props) => {
  const customStyles: any = {
    control: (provided: CSSProperties, state: any) => ({
      ...provided,
      borderRadius: "10px",
    }),
  };
  const tokens = [
    {
      label: "USDC",
      value: "1",
      icon: <Icon name="usdc" size="20px" />,
    },
    {
      label: "ETH",
      value: "0",
      icon: <Icon name="ethereum" size="20px" />,
    },
  ];

  return (
    <Root>
      <Container>
        <Label>Send</Label>
        <StyledSelect
          styles={customStyles}
          options={tokens}
          placeholder={null}
          onChange={onSelectAsset}
          components={{ Option: IconOption, SingleValue: ValueOption }}
        />
      </Container>
    </Root>
  );
};

export default AssetSelect;
