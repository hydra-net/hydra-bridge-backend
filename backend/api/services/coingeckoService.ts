import axios from "axios";

export const fetchEthUsdPrice = async () : Promise<number> => {
  try {
    const res = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );

    return res.data.ethereum.usd;
  } catch (e) {
    console.log(e);
  }

  // .then((res) => {
  //   const headerDate =
  //     res.headers && res.headers.date ? res.headers.date : "no response date";
  //   console.log("Status Code:", res.status);
  //   console.log("Date in Response header:", headerDate);

  //   const price = res.data;
  //   console.log(price);
  //   return price;
  // })
  // .catch((err) => {
  //   console.log("Error: ", err.message);
  // });
};
