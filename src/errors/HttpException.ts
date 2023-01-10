class HttpException extends Error {
	public status: number;
	public message: string;

	constructor(status: number, message: string | undefined) {
		super(message);
		this.status = status;
		if (message != undefined) this.message = message;
	}
}

export default HttpException;
