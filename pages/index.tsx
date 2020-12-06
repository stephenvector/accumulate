import { useEffect } from "react";
import { NextPageContext, GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import Head from "next/head";

type HomeProps = {
  code: null | string;
  access_token: null | string;
  token_type: null | string;
  scope: null | string;
};

export default function Home(props: HomeProps) {
  const router = useRouter();

  useEffect(() => {
    if (props.access_token && typeof router.query.code === "string") {
      router.push("/", undefined, { shallow: true });
    }
  }, [props, router]);

  return (
    <div>
      <Head>
        <title>Home</title>
      </Head>
      <a
        href={`https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&scope=repo`}
      >
        Login With GitHub
      </a>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { code } = context.query;
  if (typeof code !== "string") {
    return {
      props: {
        code: null,
        access_token: null,
        token_type: null,
        scope: null,
      },
    };
  }
  const res = await fetch(`https://github.com/login/oauth/access_token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: code,
    }),
  });

  const { access_token, token_type, scope } = await res.json();

  console.log(context);

  const returnProps = {
    props: {
      code,
      access_token: typeof access_token === "string" ? access_token : null,
      token_type: typeof token_type === "string" ? token_type : null,
      scope: typeof scope === "string" ? scope : null,
    },
  };

  if (returnProps.props.access_token) {
    const user = await fetch(`https://api.github.com/user`, {
      headers: {
        Authorization: `Bearer ${returnProps.props.access_token}`,
      },
    });
    const userJSON = await user.json();
    console.log(userJSON);
  }

  return returnProps;
}
