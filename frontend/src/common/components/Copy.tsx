import Icon from "./Icon/Icon";

type Props = {
  onCopy?: () => void;
  payload: string;
};


const Copy = (props: Props) => {
  const onCopyClicked = (e: any) => {
    // prevent parent click handler from firing
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(props.payload).then(
      () => {
        if (props.onCopy) {
          props.onCopy();
        }
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  return <Icon name="copy"  onClick={(e : any) => onCopyClicked(e)} />;
};

export default Copy;
