const formatNumber = (amount: string | number, toFixed: boolean = false) => {
  return toFixed
    ? parseFloat(amount.toString())
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, "$&,")
    : amount.toString().replace(/(\d)(?=(\d{3})+$)/g, "$&,");
};

export default formatNumber;
