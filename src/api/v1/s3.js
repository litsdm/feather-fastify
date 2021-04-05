import signS3Put from './actions/s3/signPut';
import signS3Get from './actions/s3/signGet';
import deleteS3 from './actions/s3/delete';

export default async fastify => {
  fastify.get('/sign', signS3Put.options, signS3Put.handler);
  fastify.get('/get', signS3Get.options, signS3Get.handler);

  fastify.delete('/delete', deleteS3.options, deleteS3.handler);
};
