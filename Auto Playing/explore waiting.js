// function sleep(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// async function wait(time) {
//   await sleep(time);
// }

// async function print(x) {
//   await wait(5000);
//   console.log(x);
// }

function sleep(s) {
  return new Promise((resolve) => setTimeout(resolve, s * 1000));
}

async function print(x, time) {
  await sleep(time);
  console.log(x);
}

print("hello", 5);
