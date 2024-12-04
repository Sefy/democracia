import { Container } from "../services/container";
import express from "express";
import { UserService } from "../services/user.service";

export class AuthRouter {
  constructor(
    private container: Container
  ) {
  }

  build() {
    const router = express.Router();

    router.post('/login-google', async (req, res, next) => {
      const googleToken = req.body.token;

      if (!googleToken) {
        res.status(400).json({error: 'Token manquant dans la requête'});
        return;
      }

      // @TODO: ola, gros ménage ! :D d'accord on se sert du User Google, mais faut renvoyer le User de la base heinnn

      try {
        // Vérification du token Google
        const googleUser = await this.userService.verifyGoogleToken(googleToken);

        let user = await this.userService.getOneByEmail(googleUser.email!);

        const firstLogin = !user;

        if (!user) {
          // @TODO: sinon erreur à la création du user
          user = (await this.userService.createUser(googleUser))!;
        }

        const token = this.userService.generateToken({id: user.id, email: googleUser.email});

        const responseData = {token} as any;

        // pour demander un Username (@TODO: prendre le nom
        if (firstLogin) {
          responseData.firstLogin = true;
        }

        res.status(200).json(responseData);
      } catch (error: any) {
        next(error);
      }
    });

    router.post('/logout', (req, resp) => {
      req.session.destroy((err) => {
        resp.send({ok: !err, error: err});
      });
    });

    router.get('/get-session', async (req, resp, next) => {
      const token = this.userService.getTokenFromRequest(req.headers.authorization);

      try {
        if (token) {
          const authUserData = await this.userService.authentifyToken(token);

          if (authUserData?.email) {
            const user = await this.userService.getOneByEmail(authUserData.email);

            if (user) {
              resp.send({ok: true, user});
              return;
            }
          }
        }

        resp.send({ok: false});
      } catch (e) {
        next(e);
      }
    });

    router.post('/set-username', async (req, res) => {
      const user = await this.userService.getUserFromRequestToken(req.headers.authorization);

      if (!user) {
        res.status(401).send({ok: false, error: 'User not found'});
        return;
      }

      const newUsername = this.userService.getCleanUsername(req.body.username);

      if (!newUsername || !newUsername.length) {
        res.send({ok: false, error: 'Username cannot be empty'});
        return;
      }

      if (user.username === newUsername) {
        // no-op
        res.send({ok: true});
        return;
      }

      const existing = await this.userService.findByUsername(newUsername);

      if (existing) {
        res.send({ok: false, error: 'username.already.exists'});
        return;
      }

      // si on arrive là c'est qu'on est bon ? => on peut save

      user.username = newUsername;

      const queryResult = await this.userService.updateUser(user);

      res.send({ok: queryResult.rowCount === 1});
    });

    return router;
  }

  get userService() {
    return this.container.get('user.service') as UserService;
  }
}
