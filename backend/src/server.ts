import app from './app';
import 'dotenv/config';
import health from 'express-healthcheck';

const PORT = process.env.PORT || 3000;

app.use('/health', health());
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});