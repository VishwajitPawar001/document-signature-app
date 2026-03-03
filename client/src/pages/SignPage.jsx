import { useParams } from "react-router-dom";

function SignPage() {
    const { token } = useParams();

    return (
        <div style={{ padding: "40px"}}>
            <h2>Public Signing Page</h2>
            <p>Token:</p>
            <strong>{token}</strong>
        </div>
    );
}

export default SignPage;