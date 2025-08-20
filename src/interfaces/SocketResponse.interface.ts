interface ISocketResponse<T = unknown> {
  data: T,
  message: string;
}

export default ISocketResponse;
