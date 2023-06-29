function MyApp({ Component, ...rest }) {
  const { pageProps } = props;
  return <Component {...pageProps} />;
}

export default MyApp;
