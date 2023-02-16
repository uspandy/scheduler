# NEVER STORE KEYS LIKE THIS, IT'S JUST A STUB FOR TEST TASK

Create environment => file mapping on production container

Or you can generate via openssl (ES512 alghorhytm)

```bash
openssl ecparam -name secp521r1 -genkey -noout -out ./jwtKeys/jwtES512.key                
openssl ec -in ./jwtKeys/jwtES512.key -pubout -out ./jwtKeys/jwtES512.key.pub
```
