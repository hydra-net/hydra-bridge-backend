import styled, { CSSProperties } from "styled-components";
import Icon from "../Icon/Icon";
import Select from "react-select";
import IconOption from "../Select/IconOption";
import ValueOption from "../Select/ValueOption";
import { getFlexCenter, getHorizontalGap } from "../../styles";
import { TokenResponseDto } from "../../dtos";
import { IconKeys } from "../../commonTypes";

const Root = styled.div``;

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
  isLoading?: boolean;
  tokens: TokenResponseDto[];
  onSelectAsset: (value: any) => void;
};
const AssetSelect = ({ tokens, onSelectAsset, isLoading,  }: Props) => {
  const customStyles: any = {
    control: (provided: CSSProperties, state: any) => ({
      ...provided,
      borderRadius: "10px",
    }),
  };

  return (
    <Root>
      <Container>
        <Label>Send</Label>
        <StyledSelect
          styles={customStyles}
          options={tokens ? tokens.map((token: TokenResponseDto, index: number) => {
            const name = token.symbol.toLocaleLowerCase() as IconKeys;
            return {
              label: token.symbol,
              value: index.toString(),
              icon: <Icon name={name} size="20px" />,
            };
          }) : []}
          placeholder={null}
          onChange={onSelectAsset}
          components={{ Option: IconOption, SingleValue: ValueOption }}
          isDisabled={isLoading}
        />
      </Container>
    </Root>
  );
};

export default AssetSelect;
