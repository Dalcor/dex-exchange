import {
  ApolloClient,
  ApolloLink,
  concat,
  HttpLink,
  InMemoryCache,
  useQuery,
} from "@apollo/client";
import gql from "graphql-tag";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { Address, isAddress } from "viem";

import Checkbox from "@/components/atoms/Checkbox";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import Input from "@/components/atoms/Input";
import TextField from "@/components/atoms/TextField";
import Button from "@/components/buttons/Button";
import { ManageTokensDialogContent } from "@/components/manage-tokens/types";
import { db } from "@/db/db";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import addToast from "@/other/toast";
import { Token } from "@/sdk_hybrid/entities/token";

const authMiddleware = new ApolloLink((operation, forward) => {
  operation.setContext(() => ({
    uri: "https://api.studio.thegraph.com/proxy/56540/dex223-auto-listing-sepolia/version/latest/",
  }));

  return forward(operation);
});
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: concat(
    authMiddleware,
    new HttpLink({
      uri: "https://api.studio.thegraph.com/proxy/56540/dex223-auto-listing-sepolia/version/latest/",
    }),
  ),
});

const query = gql`
  query AutoListings($address: String!) {
    autoListings(where: { id: $address }) {
      id
      owner
      name
      lastUpdated
      totalTokens
      tokens {
        timestamp
        token {
          addressERC20
          addressERC223
          name
          symbol
          decimals
          numberAdditions
        }
      }
    }
  }
`;

interface Props {
  setContent: (content: ManageTokensDialogContent) => void;
}
export default function ImportListWithContract({ setContent }: Props) {
  const t = useTranslations("ManageTokens");
  const chainId = useCurrentChainId();
  const [addressToImport, setAddressToImport] = useState("");
  const [checkedUnderstand, setCheckedUnderstand] = useState<boolean>(false);

  const { data, loading } = useQuery(query, {
    variables: {
      address: addressToImport.toLowerCase(),
    },
    client,
  });

  const error = useMemo(() => {
    if (addressToImport && !isAddress(addressToImport)) {
      return "Enter contract address in correct format";
    }

    if (
      addressToImport &&
      isAddress(addressToImport) &&
      !loading &&
      !Boolean(data.autoListings?.[0])
    ) {
      return "Contract address does not contain a token list";
    }

    return "";
  }, [addressToImport, data?.autoListings, loading]);
  console.log(data);

  return (
    <div className="flex flex-col flex-grow">
      <TextField
        label="Import token list from contract"
        type="text"
        value={addressToImport}
        onChange={(e) => {
          setAddressToImport(e.target.value);
        }}
        error={error}
      />

      {!addressToImport && (
        <div className="flex-grow flex justify-center items-center flex-col gap-2">
          <EmptyStateIcon iconName="autolisting" />
          <p className="text-secondary-text text-center">
            To import a list through a contract, enter contract address in correct format{" "}
          </p>
        </div>
      )}

      {addressToImport && !isAddress(addressToImport) && (
        <div className="flex-grow flex justify-center items-center flex-col gap-2">
          <EmptyStateIcon iconName="warning" />
          <p className="text-red-input text-center">Enter valid contract address</p>
        </div>
      )}

      {addressToImport &&
        isAddress(addressToImport) &&
        !loading &&
        !Boolean(data.autoListings?.[0]) && (
          <div className="flex-grow flex justify-center items-center flex-col gap-2">
            <EmptyStateIcon iconName="warning" />
            <p className="text-red-input text-center">
              Contract address does not contain a token list
            </p>
          </div>
        )}

      {Boolean(data?.autoListings?.[0]) && (
        <div>
          <div>
            Tokenlist found:{" "}
            {data?.autoListings?.[0].name === "unknown"
              ? `Autolisting ${data?.autoListings?.[0].id.toLowerCase().slice(0, 6)}...${data?.autoListings?.[0].id.toLowerCase().slice(-6)}`
              : data?.autoListings?.[0].name}
          </div>
          <div>Total tokens: {data?.autoListings?.[0].tokens.length}</div>

          <Checkbox
            checked={checkedUnderstand}
            handleChange={() => setCheckedUnderstand(!checkedUnderstand)}
            id="approve-list-import"
            label={t("i_understand")}
          />
          <Button
            disabled={!data?.autoListings?.[0]}
            onClick={async () => {
              const queryRes = data?.autoListings?.[0];
              if (!queryRes) {
                addToast("Something went wrong, please, contact support");
                return;
              }
              await db.tokenLists.add({
                autoListingContract: queryRes.id.toLowerCase(),
                lastUpdated: queryRes.lastUpdated,
                list: {
                  logoURI: "/token-list-placeholder.svg",
                  name:
                    queryRes.name === "unknown"
                      ? `Autolisting ${queryRes.id.toLowerCase().slice(0, 6)}...${queryRes.id.toLowerCase().slice(-6)}`
                      : queryRes.name,
                  version: {
                    major: 0,
                    minor: 0,
                    patch: 1,
                  },
                  tokens: queryRes.tokens.map(({ token }: any) => {
                    console.log(token.decimals);
                    return new Token(
                      chainId,
                      token.addressERC20,
                      token.addressERC223,
                      +token.decimals,
                      token.symbol,
                      token.name,
                      "/tokens/placeholder.svg",
                    );
                  }),
                },
                chainId,
                enabled: true,
              });
              addToast("Tokenlist imported successfully!");
              setContent("default");
            }}
          >
            Import
          </Button>
        </div>
      )}
    </div>
  );
}
