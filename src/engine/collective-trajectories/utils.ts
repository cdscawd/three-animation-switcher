export function fibonacciSphere(count: number): Float32Array {
  const arr = new Float32Array(count * 3)
  const golden = Math.PI * (3 - Math.sqrt(5))

  for (let k = 0; k < count; k++) {
    const z = 1 - ((k + 0.5) / count) * 2
    const r = Math.sqrt(Math.max(0, 1 - z * z))
    const th = golden * k
    arr[k * 3] = Math.cos(th) * r
    arr[k * 3 + 1] = Math.sin(th) * r
    arr[k * 3 + 2] = z
  }

  return arr
}
