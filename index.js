// const countDown1 = n => {
//   const timer = setInterval(() => {
//     if (n <= 0) clearInterval(timer);

//     console.log(n);
//     n--;
//   }, 1000);
// };

// countDown1(10);

const countDown2 = n => {
  const timer = setTimeout(() => {
    if (n <= 0) clearTimeout(timer);
    console.log(n);
    n--;
  }, 1000);
};

countDown2(10);
