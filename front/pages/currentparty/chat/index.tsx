import Button from '@/components/common/Button';
import Layout from '@/components/common/Layout';
import InfoTable from '@/components/party/InfoTable';
import { WithRouterProps } from 'next/dist/client/with-router';
import { withRouter } from 'next/router';
import React from 'react';
import Image from 'next/image';
import { PartySystemContext, PartySystemContextType } from '@/contexts/party';
import { get_auth } from '@/utils/auth';

type ChatBubbleProps = {
  text: string;
  user: string;
  isMe: boolean;
  isHost: boolean;
  time: string;
};

type SystemBubbleProps = {
  text: string;
};

function UserChatBubble(props: ChatBubbleProps) {
  return (
    <div className={props.isMe ? 'flex flex-row-reverse' : 'flex'}>
      {!props.isMe && (
        <div className="pr-2.5">
          <div className="rounded-full bg-primary p-0.5 -translate-y-1">
            <img
              src="/meat.png"
              className="w-7 h-7 object-cover rounded-full "
            />
          </div>
        </div>
      )}
      <div className="">
        {props.isMe ? (
          <>
            <div className="flex flex-row-reverse gap-2">
              <p className="bg-secondary text-dark-gray p-2 px-4 rounded-3xl">
                {props.text}
              </p>
              <span className="text-sm text-gray-500 self-end">
                {props.time}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex gap-2">
              <div className="text-xs pb-2">{props.user}</div>
              {props.isHost && (
                <img alt="crown" src="/crown.png" className="w-4 h-4" />
              )}
            </div>
            <div className="flex gap-2">
              <p className="bg-primary text-white p-2 px-4 rounded-3xl">
                {props.text}
              </p>
              <span className="text-sm text-gray-500 self-end">
                {props.time}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SystemChatBubble(props: SystemBubbleProps) {
  return (
    <div className="flex justify-center py-2">
      <div className="flex flex-col items-center">
        <div className="bg-[#181818A0] text-cream px-3 py-0.5 rounded-3xl text-xs text-center">
          {props.text}
        </div>
      </div>
    </div>
  );
}

type PartyChatState = {};

class PartyChat extends React.Component<WithRouterProps, PartyChatState> {
  static contextType?: React.Context<PartySystemContextType> =
    PartySystemContext;
  TextRef: React.RefObject<HTMLDivElement> | null = null;
  MessageRef: React.RefObject<HTMLDivElement> | null = null;
  constructor(props: WithRouterProps) {
    super(props);
    this.state = {};
    this.TextRef = React.createRef();
    this.MessageRef = React.createRef();
  }

  setFocus = () => {
    this.TextRef?.current?.focus();
  };

  handleSend = () => {
    const textMessage = this.TextRef?.current?.innerText;
    const partySystem = this.context as PartySystemContextType;
    if (!textMessage || textMessage.length <= 0) return;

    partySystem?.chat_message_party?.(textMessage);
    this.TextRef!.current!.innerText = '';
    this.MessageRef!.current!.scrollTo(0, 999999999);
    this.setFocus();
  };

  render() {
    const { router } = this.props;
    const partySystem = this.context as PartySystemContextType;
    const { currentPartyInfo, currentChatSession } = partySystem;
    const dialogues = currentChatSession?.dialogues ?? [];
    if (router.isReady && !partySystem?.currentPartyInfo) {
      router.push('/home');
    }

    return (
      <Layout type="chat" title={currentPartyInfo?.party_name ?? ''}>
        <div className="flex flex-col p-2 px-5 rounded-t-2xl fixed bottom-0 left-0 sm:left-[12.5%] md:left-[20%] w-screen sm:w-[75vw] md:w-[60vw]">
          <div
            className="flex flex-col gap-2 h-[90dvh] overflow-y-auto containerscroll"
            ref={this.MessageRef}
          >
            <div className="pb-24"></div>
            {currentChatSession?.status == 'open' ? (
              <SystemChatBubble text="Please be respectful to other user in the party!" />
            ) : (
              <SystemChatBubble text="Connecting to chat, please wait." />
            )}
            {dialogues.map(message => {
              return message.type == 'user_chat_message' ? (
                <UserChatBubble
                  user={`${message?.user_first_name} ${message?.user_last_name}`}
                  text={message?.message}
                  time={new Date(message?.timestamp).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                    hourCycle: 'h23',
                  })}
                  isMe={message?.user_id == get_auth().user?.user_id}
                  isHost={message?.user_id == currentPartyInfo?.host_id}
                />
              ) : (
                <SystemChatBubble text={message?.message} />
              );
            })}
            <div className="pb-2"></div>
          </div>
          <div className="w-full min-h-16 max-h-[16dvh] flex justify-center align-middle pb-6 pt-2">
            <div className="self-center w-5/6 ">
              <div
                contentEditable={true}
                className="w-full text-sm min-h-10 max-h-[10dvh] containerscroll overflow-x-auto break-words rounded-2xl border-2 border-redish bg-transparent p-2 px-4"
                placeholder="Type a message"
                ref={this.TextRef}
              ></div>
            </div>
            <button
              className="w-fit h-fit self-center pl-4"
              onClick={() => {
                this.handleSend();
              }}
            >
              <img src="/send.png" className="h-9" />
            </button>
          </div>
        </div>
      </Layout>
    );
  }
}

export default withRouter(PartyChat);
